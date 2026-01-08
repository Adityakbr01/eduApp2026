#Run this command for first time to give acces chmod +x deploy.dev.sh in bash terminal
# Then run the script using ./deploy.dev.sh

#!/bin/bash
set -e
# set -e: agar koi command fail ho jaaye to script turant exit ho jaaye

# -----------------------------
# CONFIG
# -----------------------------
FRONTEND_IMAGE=adityakbr/eduapp2026:frontend-dev
BACKEND_IMAGE=adityakbr/eduapp2026:backend-dev
COMPOSE_FILE=docker-compose.dev.yml

# -----------------------------
# HELPER FUNCTION: check if image exists locally
# -----------------------------
image_exists() {
  docker image inspect "$1" > /dev/null 2>&1
}

# -----------------------------
# FRONTEND
# -----------------------------
if image_exists $FRONTEND_IMAGE; then
  echo "✅ Frontend image exists locally: $FRONTEND_IMAGE"
else
  echo "🔨 Frontend image not found. Building..."
  docker build -t $FRONTEND_IMAGE ./client
  echo "📦 Pushing frontend image to Docker Hub..."
  docker push $FRONTEND_IMAGE
fi

# -----------------------------
# BACKEND
# -----------------------------
if image_exists $BACKEND_IMAGE; then
  echo "✅ Backend image exists locally: $BACKEND_IMAGE"
else
  echo "🔨 Backend image not found. Building..."
  docker build -t $BACKEND_IMAGE ./server
  echo "📦 Pushing backend image to Docker Hub..."
  docker push $BACKEND_IMAGE
fi

# -----------------------------
# PULL LATEST (ensure latest images from Docker Hub)
# -----------------------------
echo "⬇️ Pulling latest images from Docker Hub..."
docker compose -f $COMPOSE_FILE pull

# -----------------------------
# STOP OLD CONTAINERS
# -----------------------------
echo "🛑 Stopping old DEV containers..."
docker compose -f $COMPOSE_FILE down

# -----------------------------
# START DEV CONTAINERS
# -----------------------------
echo "🚀 Starting DEV containers..."
docker compose -f $COMPOSE_FILE up -d

echo "✅ DEV DEPLOYMENT COMPLETE"
