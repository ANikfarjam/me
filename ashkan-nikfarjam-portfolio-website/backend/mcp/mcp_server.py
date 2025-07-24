from typing import Any, Optional, List, Dict
import traceback
import numpy as np
import httpx
from fastapi import Body
from fastapi.responses import JSONResponse
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
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
MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY')
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_MODEL = "mistral-small"

# Initialize components with error handling
try:
    db = VectorDB()
    print("Indexes in Pinecone:", db.list_indexes())
except Exception as e:
    print(f"Failed to initialize VectorDB: {str(e)}")
    raise SystemExit(1)

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

def mistral_call(prompt: str) -> str:
    """Wrapper for Mistral API calls with better error handling."""
    try:
        headers = {
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": MISTRAL_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
        
        # Use a session with retries
        session = requests.Session()
        retry = requests.adapters.HTTPAdapter(max_retries=3)
        session.mount('https://', retry)
        
        response = session.post(
            MISTRAL_API_URL,
            headers=headers,
            json=payload,
            timeout=30,
            verify=False  # Temporarily disable SSL verification
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.SSLError:
        raise HTTPException(
            status_code=502,
            detail="SSL verification failed. Please check your certificates."
        )
    except Exception as e:
        print("Mistral API Error:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Mistral API request failed: {str(e)}"
        )

def get_query_embedding(query: str) -> List[float]:
    """Get embedding for a query with error handling"""
    try:
        embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        embeddings = list(embedding_model.embed(query))
        return [float(x) for x in embeddings[0]]
    except Exception as e:
        print("Embedding generation error:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Embedding generation failed: {str(e)}"
        )

@app.post("/query")
async def generate_content(request: QueryRequest):
    try:
        print(f"Received query: {request.text}")
        
        # Step 1: Get relevant documents
        documents = await query_documents(request)
        print(f'Found {len(documents)} relevant documents')
        
        # Step 2: Construct context and summarize it
        full_context = "\n\n".join([doc.text for doc in documents])
        
        # Summarize the context to be more concise
        summarization_prompt = f"""
        Summarize the following information about Ashkan Nikfarjam, keeping only the details 
        most relevant to this question: "{request.text}".
        
        Be concise but accurate. Include key facts, numbers, and specific achievements when available.
        Do not add any information not present in the context.
        
        Context:
        {full_context}
        
        Concise summary:
        """
        
        summarized_context = mistral_call(summarization_prompt)
        
        # Step 3: Generate final response
        response_prompt = f"""
        You are a professional assistant for Ashkan Nikfarjam's portfolio. 
        Answer the question using ONLY the summarized context below.
        Be professional, concise, and accurate.
        If the question cannot be answered with the context, say:
        "I don't have enough information about that aspect of Ashkan's background."
        
        Question: {request.text}
        
        Context:
        {summarized_context}
        
        Answer:
        """
        
        response = mistral_call(response_prompt)
        return {"response": response.strip()}

    except HTTPException as he:
        # Return user-friendly messages for client-facing errors
        if he.status_code == 400:
            return JSONResponse(
                status_code=400,
                content={"response": "I can only answer questions about Ashkan Nikfarjam's professional background including education, projects, work experience, and resume."}
            )
        raise
    except Exception as e:
        print("Server error:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

async def get_general_info(request: QueryRequest) -> List[DocumentResponse]:
    try:
        indexes = db.list_indexes()
        combined_results = []

        query_embedding = get_query_embedding(request.text)

        for index_name in indexes:
            try:
                results = db.query_index(
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
            category = mistral_call(category_prompt).lower().strip()
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
        query_embedding = get_query_embedding(request.text)
        print('Query embedding generated')

        # Step 3: Query vector DB
        results = db.query_index(
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
                score=result.score
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
        test_response = mistral_call("Test connection")
        print("Mistral AI initiated successfully!")
    except Exception as e:
        print(f"Mistral AI test failed: {str(e)}")
        sys.exit(1)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        ssl_keyfile=None,  # Add paths if using HTTPS
        ssl_certfile=None  # Add paths if using HTTPS
    )