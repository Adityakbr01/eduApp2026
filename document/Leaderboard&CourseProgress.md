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







# GPT SAYS

Short answer first:

If properly configured, this architecture can handle:

* ✅ 50k–100k concurrent users easily
* ✅ 1M+ total enrolled users per course (leaderboard wise)
* ✅ Thousands of progress updates per minute
* ✅ Real-time leaderboard with O(log N) complexity

But…

There are limits. Let’s break it down properly.

---

# 🔥 1️⃣ Leaderboard Capacity

You are using:

```
Redis Sorted Set (ZSET)
ZADD
ZREVRANK
ZREVRANGE
```

### Complexity

| Operation | Time Complexity |
| --------- | --------------- |
| ZADD      | O(log N)        |
| ZREVRANK  | O(log N)        |
| ZREVRANGE | O(log N + M)    |

This is extremely scalable.

---

### How Much Can Redis Handle?

On a properly configured Redis server:

* 100k updates/sec (small payload)
* Millions of sorted set members
* < 1ms latency for rank queries

So your leaderboard system can realistically handle:

```
1M+ users per course
```

Without breaking.

The only real limit becomes:

* Redis RAM
* Network throughput
* Horizontal scaling setup

---

# ⚠️ 2️⃣ Course Progress Recalculation – Real Bottleneck

Now this is important.

Your current recalculation logic:

> Fetch ALL content
> Fetch ALL user attempts
> Recalculate everything

### Complexity

If:

* Course has 1000 contents
* 50k users active
* Each completion triggers full recalculation

Then:

```
1000 content reads × 50k events
```

That becomes heavy.

Even though it runs in background, Mongo CPU will increase.

---

# 🚨 What Breaks First?

In order:

1. Mongo aggregation load
2. Worker CPU saturation
3. Redis memory (if not configured)
4. Queue backlog if spikes occur

Leaderboard will NOT break first.

Progress recalculation will.

---

# 📊 3️⃣ Realistic Handling Capacity

With:

* 4 CPU cores
* 8–16GB RAM
* Proper Redis config
* Mongo indexes optimized

You can handle:

| Metric                    | Safe Range |
| ------------------------- | ---------- |
| Concurrent users          | 20k–50k    |
| Enrolled users per course | 200k+      |
| Leaderboard size          | 1M+        |
| Progress updates/sec      | 1k–3k      |

Above that, you need horizontal scaling.

---

# 🧠 4️⃣ When You Cross 100k Concurrent Users

You must upgrade:

### ✅ 1. Incremental Progress Updates

Instead of full recalculation:

When content completed:

```
completedContents++
obtainedMarks += content.marks
```

No full scan.

This reduces Mongo load drastically.

---

### ✅ 2. Partition Leaderboards

If 10M users:

Split by:

```
course:{id}:leaderboard:2026
course:{id}:leaderboard:2027
```

Or by shard.

---

### ✅ 3. Horizontal Worker Scaling

BullMQ supports multiple workers.

You can:

```
pm2 scale progress-worker 8
```

Jobs will distribute.

---

# 🏎 5️⃣ Real Enterprise Numbers

Big LMS platforms:

* Millions of users
* 100k+ concurrent
* Multiple Redis clusters
* Mongo sharding
* Dedicated leaderboard service

Your architecture is ready to evolve into that.

---

# 🎯 Honest Assessment

Your current design is:

🟢 Production ready for:

* Startup
* College platform
* SaaS MVP
* Mid-scale product

🟡 Needs optimization for:

* 100k+ live concurrency
* Massive viral growth

🔴 Not yet ready for:

* 1M+ concurrent users without sharding

---

# 🏆 Final Answer

Your system can safely handle:

```
~50,000 concurrent users
~1,000 progress updates/sec
~1M leaderboard users
```