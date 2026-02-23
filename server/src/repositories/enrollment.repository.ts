import type { Types, FilterQuery, UpdateQuery } from "mongoose";
import Enrollment, { EnrollmentStatus, type IEnrollment } from "src/models/enrollment.model.js";

// ============================================
// ENROLLMENT REPOSITORY
// ============================================
export const enrollmentRepository = {
    // -------------------- CREATE --------------------
    create: async (data: Partial<IEnrollment>): Promise<IEnrollment> => {
        return Enrollment.create(data);
    },

    // -------------------- FIND BY ID --------------------
    findById: async (id: string | Types.ObjectId): Promise<IEnrollment | null> => {
        return Enrollment.findById(id);
    },

    // -------------------- FIND BY ID WITH DETAILS --------------------
    findByIdWithDetails: async (id: string | Types.ObjectId): Promise<IEnrollment | null> => {
        return Enrollment.findById(id)
            .populate("userId", "name email avatar")
            .populate({
                path: "courseId",
                select: "title slug coverImage instructor",
                populate: {
                    path: "instructor",
                    select: "name avatar",
                },
            });
    },

    // -------------------- FIND BY USER AND COURSE --------------------
    findByUserAndCourse: async (
        userId: string | Types.ObjectId,
        courseId: string | Types.ObjectId
    ): Promise<IEnrollment | null> => {
        return Enrollment.findOne({ userId, courseId });
    },

    // -------------------- FIND ACTIVE ENROLLMENT --------------------
    findActiveEnrollment: async (
        userId: string | Types.ObjectId,
        courseId: string | Types.ObjectId
    ): Promise<IEnrollment | null> => {
        return Enrollment.findOne({
            userId,
            courseId,
            status: EnrollmentStatus.ACTIVE,
        });
    },

    // -------------------- CHECK IF ENROLLED --------------------
    isEnrolled: async (
        userId: string | Types.ObjectId,
        courseId: string | Types.ObjectId
    ): Promise<boolean> => {
        const enrollment = await Enrollment.exists({
            userId,
            courseId,
            status: EnrollmentStatus.ACTIVE,
        });
        return !!enrollment;
    },

    // -------------------- FIND BY ORDER ID --------------------
    findByOrderId: async (orderId: string): Promise<IEnrollment | null> => {
        return Enrollment.findOne({ orderId });
    },

    // -------------------- UPDATE BY ID --------------------
    updateById: async (
        id: string | Types.ObjectId,
        data: UpdateQuery<IEnrollment>
    ): Promise<IEnrollment | null> => {
        return Enrollment.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    },

    // -------------------- UPDATE BY ORDER ID --------------------
    updateByOrderId: async (
        orderId: string,
        data: UpdateQuery<IEnrollment>
    ): Promise<IEnrollment | null> => {
        return Enrollment.findOneAndUpdate({ orderId }, data, {
            new: true,
            runValidators: true,
        });
    },

    // -------------------- ACTIVATE ENROLLMENT --------------------
    activateEnrollment: async (
        orderId: string,
        paymentId: string,
        session: any
    ): Promise<IEnrollment | null> => {
        return Enrollment.findOneAndUpdate(
            { orderId },
            {
                status: EnrollmentStatus.ACTIVE,
                paymentId,
                enrolledAt: new Date(),
            },
            { new: true, session }
        );
    },

    // -------------------- FAIL ENROLLMENT --------------------
    failEnrollment: async (orderId: string): Promise<IEnrollment | null> => {
        return Enrollment.findOneAndUpdate(
            { orderId },
            { status: EnrollmentStatus.FAILED },
            { new: true }
        );
    },

    // -------------------- GET USER ENROLLMENTS --------------------
    findByUser: async (
        userId: string | Types.ObjectId,
        query: {
            page?: number;
            limit?: number;
            status?: EnrollmentStatus;
        } = {}
    ) => {
        const { page = 1, limit = 10, status } = query;
        const skip = (page - 1) * limit;

        const filter: FilterQuery<IEnrollment> = { userId };
        if (status) filter.status = status;

        const [enrollments, total] = await Promise.all([
            Enrollment.find(filter)
                .sort({ enrolledAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "courseId",
                    select: "title slug coverImage instructor shortDescription level",
                    populate: {
                        path: "instructor",
                        select: "name avatar",
                    },
                })
                .lean(),
            Enrollment.countDocuments(filter),
        ]);

        return {
            enrollments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    // -------------------- GET COURSE ENROLLMENTS (FOR INSTRUCTOR) --------------------
    findByCourse: async (
        courseId: string | Types.ObjectId,
        query: {
            page?: number;
            limit?: number;
            status?: EnrollmentStatus;
        } = {}
    ) => {
        const { page = 1, limit = 10, status } = query;
        const skip = (page - 1) * limit;

        const filter: FilterQuery<IEnrollment> = { courseId };
        if (status) filter.status = status;

        const [enrollments, total] = await Promise.all([
            Enrollment.find(filter)
                .sort({ enrolledAt: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("userId", "name email avatar")
                .lean(),
            Enrollment.countDocuments(filter),
        ]);

        return {
            enrollments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    // -------------------- COUNT ENROLLMENTS --------------------
    countByUser: async (userId: string | Types.ObjectId): Promise<number> => {
        return Enrollment.countDocuments({
            userId,
            status: EnrollmentStatus.ACTIVE,
        });
    },

    countByCourse: async (courseId: string | Types.ObjectId): Promise<number> => {
        return Enrollment.countDocuments({
            courseId,
            status: EnrollmentStatus.ACTIVE,
        });
    },

    // -------------------- DELETE --------------------
    deleteById: async (id: string | Types.ObjectId): Promise<IEnrollment | null> => {
        return Enrollment.findByIdAndDelete(id);
    },

    // -------------------- CHECK DUPLICATE --------------------
    exists: async (
        userId: string | Types.ObjectId,
        courseId: string | Types.ObjectId
    ): Promise<boolean> => {
        const enrollment = await Enrollment.exists({ userId, courseId });
        return !!enrollment;
    },
};

export default enrollmentRepository;
