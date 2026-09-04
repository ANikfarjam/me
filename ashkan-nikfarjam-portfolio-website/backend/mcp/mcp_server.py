from typing import Any, Optional, List, Dict
import traceback
import numpy as np
import httpx
from fastapi import Body
from fastapi.responses import JSONResponse
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
import requests
import anthropic
from pydantic import BaseModel
from fastembed import TextEmbedding
import os
from pinecone_local.vectorDB import VectorDB
from dotenv import load_dotenv
import sys
import ssl
import nltk

# Fix SSL certificate issues
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Download NLTK data with SSL workaround
try:
    nltk.download('punkt', quiet=True)
except Exception as e:
    print(f"Warning: Could not download NLTK data: {str(e)}")

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pinecone_local.vectorDB import VectorDB
load_dotenv()

# Constants
CLAUDE_API_KEY = os.getenv('CLAUDE_AI_KEY')
CLAUDE_MODEL = "claude-haiku-4-5"
PINE_API_KEY = os.getenv('PINE_API_KEY')

claude_client = anthropic.Anthropic(api_key=CLAUDE_API_KEY)

# In-memory service status — updated at startup and by real traffic
service_status = {
    "claude": "unknown",
    "pinecone": "unknown",
}

# Shown to visitors whenever Claude is unreachable because Anthropic rejected
# the request for lack of credits (billing_error, or a low/zero balance
# reported via a 400/403 response).
OUT_OF_CREDITS_MSG = (
    "Ashkan's AI assistant is temporarily out of credits and will be back once "
    "more are added. Feel free to browse the site in the meantime, or contact "
    "Ashkan directly."
)


def _is_out_of_credits(e: Exception) -> bool:
    """Detect an exhausted-balance response regardless of the exact status
    code Anthropic uses for it (observed as both 400 and 403)."""
    if getattr(e, "type", None) == "billing_error":
        return True
    return "credit balance" in str(e).lower()

# Initialize components with error handling
try:
    db = VectorDB()
    print("Indexes in Pinecone:", db.list_indexes())
    service_status["pinecone"] = "ok"
except Exception as e:
    print(f"Failed to initialize VectorDB: {str(e)}")
    service_status["pinecone"] = f"error: {str(e)}"
    db = None

# Load embedding model once at startup instead of per-request
try:
    embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
except Exception as e:
    print(f"Failed to load embedding model: {str(e)}")
    embedding_model = None

# Probe Claude once at startup to set initial status
try:
    claude_client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1,
        messages=[{"role": "user", "content": "ping"}],
        timeout=8,
    )
    service_status["claude"] = "ok"
except Exception as e:
    service_status["claude"] = f"error: {str(e)}"
print("Service status at startup:", service_status)

app = FastAPI(title="Portfolio MCP Server")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    text: str
    top_k: int = 5

class DocumentResponse(BaseModel):
    id: str
    text: str
    source: str
    score: float
    doc_type: str = "resume"  # "resume" | "supplement"

def claude_call(prompt: str, max_tokens: int = 1024) -> str:
    """Wrapper for Claude API calls with better error handling."""
    try:
        response = claude_client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        service_status["claude"] = "ok"
        return response.content[0].text
    except anthropic.RateLimitError as e:
        service_status["claude"] = "error: rate limited"
        retry_after = None
        if e.response is not None:
            retry_after = e.response.headers.get("retry-after")
        detail = (
            f"Ashkan's AI assistant has hit its usage limit and will be back in about {retry_after} seconds. "
            f"Feel free to browse the site in the meantime."
            if retry_after else
            "Ashkan's AI assistant has hit its usage limit. Please try again in a few minutes."
        )
        raise HTTPException(status_code=429, detail=detail)
    except (anthropic.PermissionDeniedError, anthropic.BadRequestError) as e:
        if _is_out_of_credits(e):
            service_status["claude"] = "error: out of credits"
            raise HTTPException(status_code=503, detail=OUT_OF_CREDITS_MSG)
        service_status["claude"] = f"error: {str(e)}"
        print("Claude API permission error:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Claude API request failed: {str(e)}"
        )
    except anthropic.APIConnectionError:
        service_status["claude"] = "error: connection failed"
        raise HTTPException(
            status_code=502,
            detail="Could not reach the Claude API. Please try again."
        )
    except Exception as e:
        if _is_out_of_credits(e):
            service_status["claude"] = "error: out of credits"
            raise HTTPException(status_code=503, detail=OUT_OF_CREDITS_MSG)
        service_status["claude"] = f"error: {str(e)}"
        print("Claude API Error:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Claude API request failed: {str(e)}"
        )

def get_query_embedding(query: str) -> List[float]:
    """Get embedding for a query with error handling"""
    try:
        if embedding_model is None:
            raise RuntimeError("Embedding model failed to load at startup")
        embeddings = list(embedding_model.embed(query))
        return [float(x) for x in embeddings[0]]
    except Exception as e:
        print("Embedding generation error:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Embedding generation failed: {str(e)}"
        )

@app.get("/")
async def root():
    """Avoid 404 noise from Render/uptime pings hitting the root path."""
    return JSONResponse(status_code=200, content={"status": "ok"})


@app.get("/health")
async def health_check():
    """Fast liveness check for Render. No external calls."""
    return JSONResponse(status_code=200, content={"status": "ok"})


@app.get("/status")
async def service_status_check():
    """Returns cached service status. No external API calls — updated by real traffic and startup probe."""
    all_ok = all(v == "ok" for v in service_status.values())
    return JSONResponse(
        status_code=200 if all_ok else 503,
        content={"status": "ok" if all_ok else "degraded", "checks": service_status}
    )


@app.post("/query")
async def generate_content(request: QueryRequest):
    try:
        print(f"Received query: {request.text}")

        # Step 1: Get relevant documents (resume facts + supplement context)
        documents = await query_documents(request)
        print(f'Found {len(documents)} relevant documents')

        # Step 2: Build structured context — resume facts separate from supplement reasoning
        resume_chunks = [doc.text for doc in documents if doc.doc_type == "resume"]
        supplement_chunks = [doc.text for doc in documents if doc.doc_type == "supplement"]

        resume_section = "\n\n".join(resume_chunks) if resume_chunks else ""
        supplement_section = "\n\n".join(supplement_chunks) if supplement_chunks else ""

        if supplement_section:
            structured_context = (
                f"=== RESUME FACTS ===\n{resume_section}\n\n"
                f"=== BACKGROUND & CONTEXT ===\n{supplement_section}"
            )
        else:
            structured_context = resume_section

        # Step 3: Summarize — instruct the model to combine both sources
        summarization_prompt = f"""You are summarizing information about Ashkan Nikfarjam for a portfolio assistant.

Question being asked: "{request.text}"

Below are two sources:
- RESUME FACTS: raw data from his resume (job titles, dates, bullet points)
- BACKGROUND & CONTEXT: supplementary notes that explain the significance, scale, and impact of his work

Produce a concise factual summary that:
1. Uses resume facts as the ground truth for dates, titles, and specifics
2. Incorporates background context to explain the impact and relevance
3. Stays strictly within the information provided — do not invent details

{structured_context}

Concise summary:"""

        summarized_context = await run_in_threadpool(claude_call, summarization_prompt)

        # Step 4: Generate final response
        response_prompt = f"""You are a professional assistant for Ashkan Nikfarjam's portfolio website.

Your job is to answer visitor questions accurately and confidently based solely on the provided context.

Rules:
- Answer directly and professionally — no filler phrases like "Based on the context..."
- If a specific fact (date, number, technology) is in the context, include it
- If the question cannot be answered from the context, say exactly: "I don't have enough information about that aspect of Ashkan's background."
- Do not speculate or add information not present in the context

Question: {request.text}

Context:
{summarized_context}

Answer:"""

        response = await run_in_threadpool(claude_call, response_prompt)
        return {"response": response.strip()}

    except HTTPException as he:
        if he.status_code == 400:
            return JSONResponse(
                status_code=400,
                content={"response": "I can only answer questions about Ashkan Nikfarjam's professional background including education, projects, work experience, and resume."}
            )
        if he.status_code in (429, 502, 503):
            return JSONResponse(status_code=he.status_code, content={"response": he.detail})
        raise
    except Exception as e:
        print("Server error:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

async def get_general_info(request: QueryRequest) -> List[DocumentResponse]:
    try:
        indexes = await run_in_threadpool(db.list_indexes)
        combined_results = []

        query_embedding = await run_in_threadpool(get_query_embedding, request.text)

        for index_name in indexes:
            try:
                results = await run_in_threadpool(
                    db.query_index,
                    index_name=index_name,
                    query_embedding=query_embedding,
                    top_k=request.top_k
                )
                if results:
                    combined_results.extend([
                        DocumentResponse(
                            id=result.id,
                            text=result.metadata["text"],
                            source=result.metadata["source"],
                            score=result.score
                        )
                        for result in results
                    ])
            except Exception as e:
                print(f"Error querying index '{index_name}': {e}")
                continue

        if not combined_results:
            raise HTTPException(status_code=404, detail="No relevant documents found.")
        
        return combined_results
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching general info: {str(e)}")


async def query_documents(request: QueryRequest) -> List[DocumentResponse]:
    """Handle document queries with improved error handling and off-topic filtering"""
    try:
        # Step 1: Determine category with stricter filtering
        category_prompt = (
            f"Classify this query into exactly one of these categories ONLY if it's related to Ashkan Nikfarjam's: "
            f"[education, projects, workexperience, resume, general info]. \n"
            f"If the question is completely unrelated to Ashkan Nikfarjam, return 'unrelated'.\n"
            f"Query: {request.text}\n"
            f"Return ONLY the category name or 'unrelated', nothing else."
        )
        
        try:
            category = (await run_in_threadpool(claude_call, category_prompt, 20)).lower().strip()
            print(f'Selected category: {category}')
            
            # Handle unrelated questions immediately
            if category == 'unrelated':
                raise HTTPException(
                    status_code=400,
                    detail="I can only answer questions about Ashkan Nikfarjam's education, projects, work experience, and resume."
                )
                
        except HTTPException:
            raise
        except Exception as e:
            print("Category classification failed:", traceback.format_exc())
            raise HTTPException(
                status_code=500,
                detail="Failed to classify query category"
            )

        if category == 'general info':
            return await get_general_info(request=request)

        # Validate category exists in Pinecone
        if category not in db.list_indexes():
            raise HTTPException(
                status_code=404,
                detail=f"Category '{category}' not found in vector database"
            )

        # Step 2: Get query embedding
        query_embedding = await run_in_threadpool(get_query_embedding, request.text)
        print('Query embedding generated')

        # Step 3: Query vector DB — use paired retrieval for categories with supplements
        SUPPLEMENT_CATEGORIES = {"workexperience", "education"}

        if category in SUPPLEMENT_CATEGORIES:
            resume_results, supplement_results = await run_in_threadpool(
                db.query_with_supplement,
                index_name=category,
                query_embedding=query_embedding,
                top_k=request.top_k
            )
            if not resume_results and not supplement_results:
                raise HTTPException(
                    status_code=404,
                    detail="No relevant information found about this topic."
                )
            docs = [
                DocumentResponse(
                    id=r.id,
                    text=r.metadata["text"],
                    source=r.metadata["source"],
                    score=r.score,
                    doc_type=r.metadata.get("doc_type", "resume")
                )
                for r in resume_results
            ] + [
                DocumentResponse(
                    id=r.id,
                    text=r.metadata["text"],
                    source=r.metadata["source"],
                    score=r.score,
                    doc_type=r.metadata.get("doc_type", "supplement")
                )
                for r in supplement_results
            ]
            return docs

        results = await run_in_threadpool(
            db.query_index,
            index_name=category,
            query_embedding=query_embedding,
            top_k=request.top_k
        )

        if not results:
            raise HTTPException(
                status_code=404,
                detail="No relevant information found about this topic."
            )

        return [
            DocumentResponse(
                id=result.id,
                text=result.metadata["text"],
                source=result.metadata["source"],
                score=result.score,
                doc_type=result.metadata.get("doc_type", "resume")
            )
            for result in results
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        print("Document query error:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Document query failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    try:
        test_response = claude_call("Test connection", 10)
        print("Claude AI initiated successfully!")
    except Exception as e:
        # Don't block server startup on Claude being reachable — the /status
        # endpoint already reports "degraded" and claude_call() will retry on
        # every real request, so a boot-time outage (e.g. no credits) should
        # not take down the whole server.
        print(f"Claude AI test failed, starting in degraded mode: {str(e)}")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        ssl_keyfile=None,  # Add paths if using HTTPS
        ssl_certfile=None  # Add paths if using HTTPS
    )