#!/bin/bash

# Exit on any error
set -e

# Step 1: Navigate to backend directory
cd .

# Step 2: Set up and activate virtual environment with uv
echo "Setting up environment using uv..."
uv venv .venv
source .venv/bin/activate

# Step 3: Install dependencies via uv
echo "Installing dependencies with uv..."
uv pip install "mcp[cli]" httpx

# Step 4: Run MCP server as module
echo "Starting MCP server..."
python3 -m mcp.mcp_server
