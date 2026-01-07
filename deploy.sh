#!/bin/bash
set -e

echo "🔵 Building frontend..."
docker build -t adityakbr/eduapp2026:frontend-prod ./client

echo "🔵 Building backend..."
docker build -t adityakbr/eduapp2026:backend-prod ./server

echo "🟢 Pushing images to Docker Hub..."
docker push adityakbr/eduapp2026:frontend-prod
docker push adityakbr/eduapp2026:backend-prod

echo "🛑 Stopping old containers..."
docker compose -f docker-compose.prod.yml down

echo "⬇️ Pulling latest images..."
docker compose -f docker-compose.prod.yml pull

echo "🚀 Starting containers..."
docker compose -f docker-compose.prod.yml up -d

echo "✅ DEPLOY COMPLETE"
