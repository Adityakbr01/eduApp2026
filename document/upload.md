Mentor Upload
↓
S3 TEMP BUCKET (you already upload here)
↓
S3 Event
↓
SQS (video-processing-queue)
↓

ecr

ECS Worker (Docker + FFmpeg)
↓
S3 PROD BUCKET (HLS)
↓
Update LessonContent.video.url → HLS path

upload/courses/6988ac6cc0ab0cb3d06a5a51/lessons/6989a4d7188a1798dac622e8/lesson-contents/698abbbae61dfd92d8da9b16/video/source-v1.mp4

prod/public/courses/6988ac6cc0ab0cb3d06a5a51/lessons/6989a4d7188a1798dac622e8/lesson-contents/698abbbae61dfd92d8da9b16/hls/v1/master.m3u8
