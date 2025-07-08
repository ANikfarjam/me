#!/bin/bash

# Settings
REMOTE_IMAGE_NAME="anikfarjam/portfolio"
DOCKERFILE_PATH="Dockerfile"

docker login
# Build and push DockerHub image with no cache
echo -e "\033[1;34mBuilding and pushing linux/amd64 image with --no-cache...\033[0m"
docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -t $REMOTE_IMAGE_NAME:backup-before-latest \
  -t $REMOTE_IMAGE_NAME:latest \
  -f $DOCKERFILE_PATH . \
  --push

if [ $? -eq 0 ]; then
  echo -e "\033[0;32m✅ Image pushed successfully to Docker Hub:\033[0m"
  echo -e "\033[1;36mhttps://hub.docker.com/r/anikfarjam/genescope_marimo/tags\033[0m"
else
  echo -e "\033[0;31m Build or push failed.\033[0m"
  exit 1
fi