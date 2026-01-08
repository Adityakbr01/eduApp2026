#!/bin/bash
set -e
# set -e ka matlab:
# Agar koi command fail ho jaaye to script turant exit kar de
# Dev environment me bhi fail-fast helpful hota hai debugging ke liye

# Deployment script for DEV environment

echo "🔵 [DEV] Building frontend image..."
# Frontend (Next.js) ka DEV image build kar rahe hain
# Usually ye image next dev / hot-reload ke liye hoti hai
docker build -t adityakbr/eduapp2026:frontend-dev ./client

echo "🔵 [DEV] Building backend image..."
# Backend (Node.js / API) ka DEV image build kar rahe hain
docker build -t adityakbr/eduapp2026:backend-dev ./server

echo "🟢 [DEV] Pushing DEV images to Docker Hub..."
# Dev images push kar rahe hain taaki same image
# multiple machines / teammates use kar saken
docker push adityakbr/eduapp2026:frontend-dev
docker push adityakbr/eduapp2026:backend-dev

echo "🛑 [DEV] Stopping old DEV containers..."
# Purane DEV containers stop & remove kar rahe hain
# taaki fresh state ke saath start ho
docker compose -f docker-compose.dev.yml down

echo "⬇️ [DEV] Pulling latest DEV images..."
# Latest DEV images pull kar rahe hain (consistency ke liye)
docker compose -f docker-compose.dev.yml pull

echo "🚀 [DEV] Starting DEV containers..."
# DEV environment containers detached mode me start honge
docker compose -f docker-compose.dev.yml up -d

echo "✅ DEV DEPLOYMENT COMPLETE"
