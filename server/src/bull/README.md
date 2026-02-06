# BullMQ Folder Structure

This directory contains the BullMQ setup for handling background jobs and asynchronous tasks.

## Structure

```
bull/
├── config/                 # Configuration files
│   └── bullmq.config.ts   # Queue names, job names, priorities
├── queues/                 # Queue definitions
│   └── email.queue.ts     # Email queue configuration
├── jobs/                   # Job dispatchers (enqueue jobs)
│   └── email/
│       ├── accountApprove.job.ts
│       ├── accountBan.job.ts
│       ├── registerOtp.job.ts
│       ├── resetPasswordOtp.job.ts
│       ├── marketingEmail.job.ts
│       └── processCampaign.job.ts
├── processors/             # Job processors (execute jobs)
│   └── email/
│       ├── marketingEmailProcessor.ts
│       └── processCampaignProcessor.ts
└── workers/                # Worker instances
    └── email.worker.ts
```

## Organization

### `config/`
Centralized configuration for BullMQ, including:
- Queue names
- Job names  
- Default job options
- Priority levels

### `queues/`
Queue definitions organized by domain (email, notifications, etc.)

### `jobs/`
**Job dispatchers** - Functions that add jobs to queues
- Keep lightweight
- Focus on data validation and queueing

### `processors/`
**Job processors** - Functions that execute when jobs are dequeued
- Contains business logic
- Handles retries and errors
- Updates job status

### `workers/`
Worker instances that:
- Connect to queues
- Route jobs to processors
- Handle concurrency

## Adding New Jobs

1. Create job dispatcher in `jobs/{domain}/`
2. Create processor in `processors/{domain}/`
3. Register processor in worker
4. Add job name to `config/bullmq.config.ts`

## Best Practices

- **Separation**: Keep job dispatchers and processors separate
- **Idempotency**: Ensure processors can safely retry
- **Logging**: Use structured logging for debugging
- **Config**: Use centralized config for consistency
