from typing import Any, Optional, List, Dict
import httpx
from fastapi import Body
from fastapi.responses import JSONResponse
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from pydantic import BaseModel
from fastembed.embedding import DefaultEmbedding
import os
from dotenv import load_dotenv
import sys
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pinecone_local.vectorDB import VectorDB
load_dotenv()
# Constants
MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY')
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_MODEL = "mistral-small"

# Initialize components
db = VectorDB()
app = FastAPI(title="Portfolio MCP Server")
# Allow requests from frontend
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
    """Wrapper for Mistral API calls."""
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
        response = requests.post(MISTRAL_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print("Mistral API Error:", e)
        raise HTTPException(status_code=500, detail="Mistral API request failed")

def get_query_embedding(query: str) -> List[float]:
    """Get embedding for a query (placeholder - implement with your embedding model)"""
    # TODO: embedding generation
    embedding_model = DefaultEmbedding()
    return list(next(embedding_model.embed(query)))


async def query_documents(request: QueryRequest) -> List[DocumentResponse]:
    """
    Handle document queries by:
    1. Determining the appropriate category using Mistral
    2. Getting embeddings for the query
    3. Querying the appropriate index
    """
    try:
        # Step 1: Determine category
        category_prompt = f"Classify this query into one category: [education, projects, work_experience, resume]. Query: {request.text}"
        category = mistral_call(category_prompt).lower().strip()
        
        # Validate category
        valid_categories = ["education", "projects", "work_experience", "resume"]
        if category not in valid_categories:
            raise HTTPException(status_code=400, detail="Invalid category classification")
        
        # Step 2: Get query embedding
        query_embedding = get_query_embedding(request.text)
        
        # Step 3: Query vector DB
        results = db.query_index(
            index_name=category,
            query_embedding=query_embedding,
            top_k=request.top_k
        )
        
        # Format response
        return [
            DocumentResponse(
                id=result.id,
                text=result.metadata["text"],
                source=result.metadata["source"],
                score=result.score
            )
            for result in results
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def generate_content(request: QueryRequest):
    try:
        # Step 1: Get relevant documents using helper function
        documents = await query_documents(request)

        # Step 2: Construct context string from document texts
        context = "\n\n".join([doc.text for doc in documents])

        # Step 3: Call Mistral with the question and the context
        prompt = f"""Answer the following question using ONLY the context below. Be accurate and concise.

        Question: {request.text}

        Context:
        {context}

        Answer:"""

        response = mistral_call(prompt)

        return JSONResponse(content={"response": response.strip()})

    except Exception as e:
        return JSONResponse(status_code=500, content={"response": f"Error: {str(e)}"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)