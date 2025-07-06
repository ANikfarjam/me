# from typing import Any, Optional, List, Dict
# import traceback
# import numpy as np
# import httpx
# from fastapi import Body
# from fastapi.responses import JSONResponse
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# import requests
# from pydantic import BaseModel
# from fastembed.embedding import DefaultEmbedding
# import os
# from dotenv import load_dotenv
# import sys
# # sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# from pinecone_local.vectorDB import VectorDB
# import nltk
# import ssl

# try:
#     _create_unverified_https_context = ssl._create_unverified_context
# except AttributeError:
#     pass
# else:
#     ssl._create_default_https_context = _create_unverified_https_context

# nltk.download('punkt')
# load_dotenv()
# # Constants
# MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY')
# MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
# MISTRAL_MODEL = "mistral-small"

# # Initialize components
# db = VectorDB()
# # right after you initialize VectorDB()
# print("Indexes in Pinecone:", db.list_indexes())
# app = FastAPI(title="Portfolio MCP Server")
# # Allow requests from frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"], 
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class QueryRequest(BaseModel):
#     text: str
#     top_k: int = 5

# class DocumentResponse(BaseModel):
#     id: str
#     text: str
#     source: str
#     score: float

# def mistral_call(prompt: str) -> str:
#     """Wrapper for Mistral API calls."""
#     try:
#         headers = {
#             "Authorization": f"Bearer {MISTRAL_API_KEY}",
#             "Content-Type": "application/json"
#         }
#         payload = {
#             "model": MISTRAL_MODEL,
#             "messages": [{"role": "user", "content": prompt}],
#             "temperature": 0.7
#         }
#         response = requests.post(MISTRAL_API_URL, headers=headers, json=payload)
#         response.raise_for_status()
#         return response.json()["choices"][0]["message"]["content"]
#     except Exception as e:
#         print("Mistral API Error:", e)
#         raise HTTPException(status_code=500, detail="Mistral API request failed")

# def get_query_embedding(query: str) -> List[float]:
#     """Get embedding for a query (placeholder - implement with your embedding model)"""
#     # TODO: embedding generation
#     embedding_model = DefaultEmbedding()
#     return list(next(embedding_model.embed(query)))


# async def query_documents(request: QueryRequest) -> List[DocumentResponse]:
#     """
#     Handle document queries by:
#     1. Determining the appropriate category using Mistral
#     2. Getting embeddings for the query
#     3. Querying the appropriate index
#     """
#     try:
#         # Step 1: Determine category
#         # print('creating prompt!')
#         # category_prompt = f"Classify this query into one category: [education, projects, work_experience, resume]. Query: {request.text}"
#         # category = mistral_call(category_prompt).lower().strip()
#         # print(f'selected category: {category}')
#         category_prompt = f"Classify this query into one category: [education, projects, workexperience, resume]. Query: {request.text}. just return the name of the categoty nothing more."

#         try:
#             category = mistral_call(category_prompt).lower().strip()
#             print(f'selected category: {category}')
#         except Exception as e:
#             print("Error in mistral_call:")
#             traceback.print_exc()
#             raise HTTPException(status_code=500, detail=f"Mistral call failed: {str(e)}")

#         # Validate category
#         valid_categories = ["education", "projects", "work_experience", "resume"]
#         if category not in valid_categories:
#             raise HTTPException(status_code=400, detail="Invalid category classification")
        
#         # # Step 2: Get query embedding
#         # query_embedding = get_query_embedding(request.text)

#         # # Convert from numpy array to list of floats
#         # # if isinstance(query_embedding, np.ndarray):
#         # #     query_embedding = query_embedding.tolist()
#         # # elif isinstance(query_embedding, np.float32):
#         # #     query_embedding = [float(query_embedding)]
#         # # Step 3: Query vector DB
#         # results = db.query_index(
#         #     index_name=category,
#         #     query_embedding=query_embedding,
#         #     top_k=request.top_k
#         # )
#         # Step 2: Get query embedding
#         raw_embedding = get_query_embedding(request.text)
#         print('raw_embeding created') if raw_embedding else print('raw_emberding not found')
#         # make absolutely sure it's a flat Python list of Python floats
#         if isinstance(raw_embedding, np.ndarray):
#             query_embedding = raw_embedding.tolist()
#         elif isinstance(raw_embedding, (np.generic,)):  # covers numpy.float32, etc.
#             query_embedding = [float(raw_embedding)]
#         else:
#             # assume it's iterable, coerce each element to float
#             query_embedding = [float(x) for x in raw_embedding]

#         # Step 3: Query vector DB
#         results = db.query_index(
#             index_name=category,
#             query_embedding=query_embedding,
#             top_k=request.top_k
#         )
#         # Format response
#         return [
#             DocumentResponse(
#                 id=result.id,
#                 text=result.metadata["text"],
#                 source=result.metadata["source"],
#                 score=result.score
#             )
#             for result in results
#         ]
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/query")
# async def generate_content(request: QueryRequest):
#     try:
#         # Step 1: Get relevant documents using helper function
#         print(type(request), request)
#         documents = await query_documents(request)
#         print(f'there are {len(documents)} fetched')

#         # Step 2: Construct context string from document texts
#         context = "\n\n".join([doc.text for doc in documents])

#         # Step 3: Call Mistral with the question and the context
#         prompt = f"""Answer the following question using ONLY the context below. Be accurate and concise.

#         Question: {request.text}

#         Context:
#         {context}

#         Answer:"""

#         response = mistral_call(prompt)

#         return JSONResponse(content={"response": response.strip()})

#     except Exception as e:
#         return JSONResponse(status_code=500, content={"response": f"Error: {str(e)}"})

# if __name__ == "__main__":
#     import uvicorn
    
#     if mistral_call("hi! how are you!"):
#         print("mistral ai initiated!")
#     else:
#         print("check mistral ai call!")
#     uvicorn.run(app, host="0.0.0.0", port=8000)
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
        
        if not documents:
            return JSONResponse(
                content={"response": "No relevant documents found"},
                status_code=404
            )

        # Step 2: Construct context
        context = "\n\n".join([doc.text for doc in documents])
        
        # Step 3: Call Mistral
        prompt = f"""Answer the following question using ONLY the context below.
        If you don't know the answer, say "I don't have information about that."

        Question: {request.text}

        Context:
        {context}

        Answer:"""
        
        response = mistral_call(prompt)
        return {"response": response.strip()}

    except HTTPException:
        raise
    except Exception as e:
        print("Server error:", traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

async def query_documents(request: QueryRequest) -> List[DocumentResponse]:
    """Handle document queries with improved error handling"""
    try:
        # Step 1: Determine category
        category_prompt = (
            f"Classify this query into one category: "
            f"[education, projects, workexperience, resume]. "
            f"Query: {request.text}. "
            f"Just return the name of the category, nothing else."
        )
        
        try:
            category = mistral_call(category_prompt).lower().strip()
            print(f'Selected category: {category}')
        except Exception as e:
            print("Category classification failed:", traceback.format_exc())
            raise HTTPException(
                status_code=500,
                detail="Failed to classify query category"
            )

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