# Start from a minimal Python base
FROM python:3.10-slim

# where the app lives in-container
WORKDIR /app

# copy in only the Pinecone vectordb client file…
COPY pinecone_local/vectorDB.py ./pinecone_local/vectorDB.py
# …and everything under mcp/
COPY mcp ./mcp

# (optional) copy in your requirements.txt if you have one
COPY requirements.txt .

# install your dependencies
RUN pip install --no-cache-dir -r requirements.txt

# default command—adjust path to your uvicorn app module
CMD ["uvicorn", "mcp.mcp_server:app", "--host", "0.0.0.0", "--port", "8000"]
