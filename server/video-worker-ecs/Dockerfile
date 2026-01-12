# Use Node 20 Alpine
FROM node:20-alpine

# Install FFmpeg for transcoding
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Install dependencies first (leverage Docker cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy all source code
COPY . .

# Build TypeScript (if needed)
RUN npm run build

# Optional: default env vars (can override in ECS task)
ENV AWS_REGION=us-east-1
ENV VIDEO_BUCKET=eduapp-bucket-prod
ENV VIDEO_BUCKET_TEMP=eduapp-bucket-temp

# Entrypoint for one-shot worker
# It will run, finish processing, and container will exit
CMD ["node", "dist/workers/videoWorker.js"]
