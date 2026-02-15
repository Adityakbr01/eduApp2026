# Server Documentation: Leaderboard & Course Progress

This document outlines the architecture for the **Leaderboard** and **Course Progress** systems, specifically focusing on their integration with **BullMQ background workers** and **Redis caching**.

## 1. High-Level Overview

The system uses an **event-driven, background processing** approach to handle heavy calculations like course progress and leaderboard updates. This ensures the API remains fast and responsive while complex aggregations happen asynchronously.

### Core Components

1.  **API Layer**: Triggers events (e.g., "Content Completed").
2.  **BullMQ (Message Queue)**: Buffers jobs for background processing.
3.  **Workers**: Process jobs to update databases and caches.
4.  **Redis**: Acts as both a primary data store for Leaderboards (Sorted Sets) and a cache for Progress.
5.  **MongoDB**: Persistent storage for all data.

---

## 2. Data Flow Architecture

### A. Course Progress Calculation

When a user completes a lesson or content item:

1.  **Trigger**: API pushes a job to the `progress` queue.
    - **Job Name**: `RECALCULATE_COURSE`
    - **Payload**: `{ userId, courseId }`
2.  **Processing** (`progress.worker.ts`):
    - Calls `courseProgressRepository.recalculate(userId, courseId)`.
3.  **Recalculation Logic**:
    - Fetches **all** content items for the course.
    - Fetches **all** user attempts (`ContentAttempt`).
    - Calculates:
      - Completion % (Completed / Total)
      - Marks (Obtained / Total)
      - **Unlocks**: Determines which sections/lessons should be visible based on sequential logic.
4.  **Storage**:
    - **MongoDB**: Upserts the `CourseProgress` document.
    - **Redis**: Caches the result (`user:{id}:course:{id}:progress`) for fast read access.

### B. Leaderboard System

The leaderboard is **real-time** and powered by Redis Sorted Sets (`ZSET`).

1.  **Trigger**: Content completion or explicit score update.
    - **Job Name**: `UPDATE_LEADERBOARD`
2.  **Processing** (`progress.worker.ts`):
    - Calls `leaderboardRepository.recalculateUserScore(courseId, userId)`.
3.  **Update Logic**:
    - Aggregates total marks from `ContentAttempt` in MongoDB.
    - Updates the user's score in the Redis Sorted Set (`ZADD`).
4.  **Retrieval** (`rank` & `top list`):
    - **Rank**: `ZREVRANK` (O(log N)) - Instant fetch of user's position.
    - **Top N**: `ZREVRANGE` (O(log N + M)) - Fetches top IDs, then hydrates user details (Name, Avatar) from MongoDB.

---

## 3. Key Components & Files

### 📂 Background Workers (`src/bull`)

- **`index.ts`**: Initializes queues and registers workers on startup.
- **`workers/progress.worker.ts`**: The main processor. Handles:
  - `RECALCULATE_COURSE`
  - `UPDATE_LEADERBOARD`
  - `REBUILD_LEADERBOARD` (Full sync from Mongo -> Redis)
  - `LOG_ACTIVITY` (Analytics)

### 📂 Repositories (`src/repositories`)

- **`progress/courseProgress.repository.ts`**: Contains the complex logic for calculating percentage and unlocking sequential content.
- **`classroom/leaderboard.repository.ts`**: Manages Redis Sorted Sets. Handles the "Cache Miss" scenario by rebuilding the leaderboard from MongoDB if Redis is empty.
- **`analytics/activityLog.repository.ts`**: Stores analytics data.

### 📂 Configuration

- **`src/configs/redis.ts`**: Manages two Redis connections:
  1.  **General Cache**: For storing API responses and Progress objects.
  2.  **BullMQ Connection**: Dedicated connection for queue management (essential for stability).

---

## 4. Why this Architecture?

| Feature                | Benefit                                                                                 |
| :--------------------- | :-------------------------------------------------------------------------------------- |
| **Async Processing**   | API validates requests instantly; heavy math (progress calc) happens in background.     |
| **Redis Leaderboards** | `O(log N)` complexity allows instant ranking even with millions of users.               |
| **Hybrid Storage**     | **Redis** for speed (Leaderboard/Cache), **Mongo** for persistence (Attempts/Profiles). |
| **Fault Tolerance**    | If a worker fails, BullMQ retries the job automatically.                                |
