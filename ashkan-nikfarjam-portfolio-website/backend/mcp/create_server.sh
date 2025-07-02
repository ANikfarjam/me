#!/bin/bash
# Create a new directory for our project
uv init portfolio
cd portfolio

# Create virtual environment and activate it
uv venv
source .venv/bin/activate

# Install dependencies
uv add "mcp[cli]" httpx

# Create our server file
touch portfolio_server.py