User upload MP4 (TEMP S3)
        ↓
S3 Event → EventBridge
        ↓
SQS (buffer + retry + rate limit)
        ↓
Scheduler (1-at-a-time guard)
        ↓
ECS Fargate (FFmpeg)
        ↓
Convert → HLS → PROD S3
        ↓
Cleanup + ACK




4️⃣ Video worker responsibilities (ECS container)

Your ECS worker should do ONLY this 👇

🧠 Worker steps (ideal)
1. Download source.mp4 from TEMP S3
2. Validate file (duration, codec, size)
3. Convert to HLS (ffmpeg)
4. Upload to PROD S3
5. Update DB (lesson status = READY)
6. Delete TEMP source
7. Delete SQS message
8. Release lock (DynamoDB)
9. Exit (container dies)