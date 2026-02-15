import mongoose from "mongoose";
import { cacheKeyFactory } from "src/cache/cacheKeyFactory.js";
import cacheManager from "src/cache/cacheManager.js";
import ContentAttempt from "src/models/course/contentAttempt.model.js";
import User from "src/models/user/user.model.js";
import logger from "src/utils/logger.js";

// ============================================
// LEADERBOARD REPOSITORY (Redis Sorted Set)
// ============================================
// O(log N) reads/writes instead of O(N) Mongo aggregation.
// Redis sorted set key: course:{courseId}:leaderboard
// Members: userId strings, Scores: total obtained marks

export const leaderboardRepository = {
    /**
     * Set a user's total score in the leaderboard
     * Used after recalculating total from ContentAttempt
     */
    async setScore(courseId: string, userId: string, score: number): Promise<void> {
        const key = cacheKeyFactory.leaderboard.sortedSet(courseId);
        await cacheManager.zadd(key, score, userId);
    },

    /**
     * Increment a user's score (for quick updates without full recalc)
     */
    async incrementScore(courseId: string, userId: string, delta: number): Promise<void> {
        const key = cacheKeyFactory.leaderboard.sortedSet(courseId);
        await cacheManager.zincrby(key, delta, userId);
    },

    /**
     * Get top N users with their scores + user details
     * O(log N + M) where M = limit
     */
    async getTopN(courseId: string, limit: number = 10): Promise<{
        entries: Array<{
            userId: string;
            name: string;
            avatar?: { url: string; version: number, key: string };
            points: number;
            rank: number;
        }>;
        isFromRedis: boolean;
    }> {
        const key = cacheKeyFactory.leaderboard.sortedSet(courseId);

        // Check if sorted set exists
        const count = await cacheManager.zcard(key);

        if (count === 0) {
            // Sorted set is empty — fall back to Mongo aggregation & rebuild
            logger.info(`[Leaderboard] Sorted set empty for course ${courseId}, rebuilding...`);
            await this.rebuildFromMongo(courseId);
        }

        // Get top N from Redis
        const entries = await cacheManager.zrevrangeWithScores(key, 0, limit - 1);

        if (entries.length === 0) return { entries: [], isFromRedis: true };

        // Fetch user details for top N
        const userIds = entries.map(e => new mongoose.Types.ObjectId(e.member));
        const users = await User.find({ _id: { $in: userIds } })
            .select("name profile.avatar")
            .lean();

        const userMap = new Map(users.map(u => [u._id.toString(), u]));

        return {
            entries: entries.map((entry, index) => {
                const user = userMap.get(entry.member) as any;
                return {
                    userId: entry.member,
                    name: user?.name || "Unknown",
                    avatar: user?.profile?.avatar,   // Already { url, version } from Mongoose
                    points: entry.score,
                    rank: index + 1,
                };
            }),
            isFromRedis: true
        };
    },

    /**
     * Get a user's rank (0-indexed from top → we return 1-indexed)
     * O(log N)
     */
    async getUserRank(courseId: string, userId: string): Promise<{ rank: number; points: number }> {
        const key = cacheKeyFactory.leaderboard.sortedSet(courseId);

        const [rank, score] = await Promise.all([
            cacheManager.zrevrank(key, userId),
            cacheManager.zscore(key, userId),
        ]);

        // If user not in sorted set, fall back to Mongo for their score
        if (rank === null) {
            const result = await ContentAttempt.aggregate([
                { $match: { courseId: new mongoose.Types.ObjectId(courseId), userId: new mongoose.Types.ObjectId(userId) } },
                { $group: { _id: "$userId", totalMarks: { $sum: "$obtainedMarks" } } },
            ]);

            const mongoScore = result.length > 0 ? result[0].totalMarks : 0;

            // Add to sorted set for future
            await this.setScore(courseId, userId, mongoScore);

            const newRank = await cacheManager.zrevrank(key, userId);

            return {
                rank: (newRank ?? 0) + 1,
                points: mongoScore,
            };
        }

        return {
            rank: rank + 1,
            points: score ?? 0,
        };
    },

    /**
     * Get total number of users in leaderboard
     * O(1)
     */
    async getTotalPlayers(courseId: string): Promise<number> {
        const key = cacheKeyFactory.leaderboard.sortedSet(courseId);
        return cacheManager.zcard(key);
    },

    /**
     * Recalculate a single user's total score from MongoDB
     * and update Redis sorted set
     */
    async recalculateUserScore(courseId: string, userId: string): Promise<number> {
        const result = await ContentAttempt.aggregate([
            {
                $match: {
                    courseId: new mongoose.Types.ObjectId(courseId),
                    userId: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $group: {
                    _id: "$userId",
                    totalMarks: { $sum: "$obtainedMarks" },
                },
            },
        ]);

        const totalScore = result.length > 0 ? result[0].totalMarks : 0;

        // Update Redis sorted set
        await this.setScore(courseId, userId, totalScore);

        return totalScore;
    },

    /**
     * Full rebuild of leaderboard from MongoDB
     * O(N) but runs in background worker, not in request cycle
     */
    async rebuildFromMongo(courseId: string): Promise<void> {
        logger.info(`[Leaderboard] Rebuilding from Mongo for course ${courseId}...`);

        const courseOid = new mongoose.Types.ObjectId(courseId);
        const key = cacheKeyFactory.leaderboard.sortedSet(courseId);

        const results = await ContentAttempt.aggregate([
            { $match: { courseId: courseOid } },
            {
                $group: {
                    _id: "$userId",
                    totalMarks: { $sum: "$obtainedMarks" },
                },
            },
        ]);

        if (results.length === 0) return;

        // Batch ZADD using pipeline
        const { redis } = await import("src/configs/redis.js");
        const pipeline = redis.pipeline();

        for (const result of results) {
            pipeline.zadd(key, result.totalMarks, result._id.toString());
        }

        await pipeline.exec();

        logger.info(`[Leaderboard] Rebuilt for course ${courseId}: ${results.length} users`);
    },

    /**
     * Remove a user from the leaderboard (e.g., unenrollment)
     */
    async removeUser(courseId: string, userId: string): Promise<void> {
        const key = cacheKeyFactory.leaderboard.sortedSet(courseId);
        await cacheManager.zrem(key, userId);
    },
};
