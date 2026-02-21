"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth";
import {
    useGetCourseReviews,
    useGetMyReview,
    useCreateReview,
    useUpdateReview,
    useDeleteReview,
    useVoteReview,
    ReviewSortBy,
} from "@/services/reviews";

export function useReviewForm(courseId: string) {
    const { user, isLoggedIn, hydrated } = useAuthStore();

    // State for review form
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [sortBy, setSortBy] = useState<ReviewSortBy>("recent");

    // Queries
    const { data: reviewsData, isLoading: isLoadingReviews } =
        useGetCourseReviews(courseId, { sortBy, limit: 10 }, true);

    const { data: myReviewData } = useGetMyReview(
        courseId,
        isLoggedIn && hydrated
    );

    // Mutations
    const createReview = useCreateReview(courseId);
    const updateReview = useUpdateReview(courseId);
    const deleteReview = useDeleteReview(courseId);
    const voteReview = useVoteReview(courseId);

    const reviews = reviewsData?.data?.reviews || [];
    const ratingSummary = reviewsData?.data?.ratingSummary;
    const myReview = myReviewData?.data?.review;
    const isEnrolled =
        user?.enrolledCourses?.some(
            (enrollment) => enrollment.courseId === courseId
        ) || false;

    // Calculate ratings percentages
    const ratingsPercentages = [
        { rating: 5, count: ratingSummary?.ratingsDistribution?.five || 0 },
        { rating: 4, count: ratingSummary?.ratingsDistribution?.four || 0 },
        { rating: 3, count: ratingSummary?.ratingsDistribution?.three || 0 },
        { rating: 2, count: ratingSummary?.ratingsDistribution?.two || 0 },
        { rating: 1, count: ratingSummary?.ratingsDistribution?.one || 0 },
    ].map((item) => {
        const total = ratingSummary?.totalReviews || 0;
        return {
            ...item,
            percentage: total > 0 ? ((item.count / total) * 100).toFixed(0) : "0",
        };
    });

    const resetForm = () => {
        setRating(0);
        setTitle("");
        setContent("");
        setIsEditing(false);
    };

    // Handle submit review
    const handleSubmitReview = async () => {
        if (!rating) {
            toast.error("Please select a rating");
            return;
        }
        if (content.length < 10) {
            toast.error("Review must be at least 10 characters");
            return;
        }

        try {
            if (isEditing && myReview) {
                await updateReview.mutateAsync({
                    reviewId: myReview._id,
                    data: { rating, title: title || undefined, content },
                });
                toast.success("Review updated successfully!");
            } else {
                await createReview.mutateAsync({
                    rating,
                    title: title || undefined,
                    content,
                });
                toast.success("Review submitted successfully!");
            }
            resetForm();
        } catch (error: unknown) {
            const message =
                (error as { response?: { data?: { error?: { message?: string } } } })
                    ?.response?.data?.error?.message || "Failed to submit review";
            toast.error(message);
        }
    };

    // Handle edit review
    const handleEditReview = () => {
        if (myReview) {
            setRating(myReview.rating);
            setTitle(myReview.title || "");
            setContent(myReview.content);
            setIsEditing(true);
        }
    };

    // Handle delete review
    const handleDeleteReview = async () => {
        if (!myReview) return;
        if (!confirm("Are you sure you want to delete your review?")) return;

        try {
            await deleteReview.mutateAsync(myReview._id);
            toast.success("Review deleted successfully!");
            resetForm();
        } catch (error: unknown) {
            const message =
                (error as { response?: { data?: { error?: { message?: string } } } })
                    ?.response?.data?.error?.message || "Failed to delete review";
            toast.error(message);
        }
    };

    // Handle vote
    const handleVote = async (
        reviewId: string,
        voteType: "helpful" | "not_helpful"
    ) => {
        if (!isLoggedIn) {
            toast.error("Please login to vote");
            return;
        }

        try {
            await voteReview.mutateAsync({ reviewId, data: { voteType } });
        } catch (error: unknown) {
            const message =
                (error as { response?: { data?: { error?: { message?: string } } } })
                    ?.response?.data?.error?.message || "Failed to vote";
            toast.error(message);
        }
    };

    const isSubmitting = createReview.isPending || updateReview.isPending;

    return {
        // Auth state
        isLoggedIn,
        isEnrolled,
        // Form state
        rating,
        setRating,
        hoveredRating,
        setHoveredRating,
        content,
        setContent,
        title,
        setTitle,
        isEditing,
        setIsEditing,
        sortBy,
        setSortBy,
        // Data
        reviews,
        ratingSummary,
        ratingsPercentages,
        myReview,
        isLoadingReviews,
        isSubmitting,
        isDeleting: deleteReview.isPending,
        // Handlers
        handleSubmitReview,
        handleEditReview,
        handleDeleteReview,
        handleVote,
        resetForm,
    };
}
