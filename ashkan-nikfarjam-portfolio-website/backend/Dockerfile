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
# Single worker by default: the fastembed/onnxruntime model is loaded once per worker
# process, and 4 workers on Render's 512Mi plan OOM'd loading 4 copies of it.
# Blocking Mistral/Pinecone calls are now offloaded to a threadpool (see mcp_server.py)
# so one worker can still serve concurrent requests. Override via WEB_CONCURRENCY if you
# upgrade the instance's memory.
CMD ["sh", "-c", "uvicorn mcp.mcp_server:app --host 0.0.0.0 --port 8000 --workers ${WEB_CONCURRENCY:-1}"]
