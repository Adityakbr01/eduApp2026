import type { Types, FilterQuery, UpdateQuery } from "mongoose";
import Payment, { PaymentStatus, type IPayment } from "src/models/payment.model.js";

// ============================================
// PAYMENT REPOSITORY
// ============================================
export const paymentRepository = {
    // -------------------- CREATE --------------------
    create: async (data: Partial<IPayment>): Promise<IPayment> => {
        return Payment.create(data);
    },

    // -------------------- FIND BY ID --------------------
    findById: async (id: string | Types.ObjectId): Promise<IPayment | null> => {
        return Payment.findById(id);
    },

    // -------------------- FIND BY ID WITH DETAILS --------------------
    findByIdWithDetails: async (id: string | Types.ObjectId): Promise<IPayment | null> => {
        return Payment.findById(id)
            .populate("userId", "name email avatar")
            .populate({
                path: "courseId",
                select: "title slug coverImage",
            })
            .populate("enrollmentId");
    },

    // -------------------- FIND BY RAZORPAY ORDER ID --------------------
    findByOrderId: async (razorpayOrderId: string, session?: any): Promise<IPayment | null> => {
        return Payment.findOne({ razorpayOrderId }, null, { session });
    },

    // -------------------- FIND BY RAZORPAY PAYMENT ID --------------------
    findByPaymentId: async (razorpayPaymentId: string, session?: any): Promise<IPayment | null> => {
        return Payment.findOne({ razorpayPaymentId }, null, { session });
    },

    // -------------------- UPDATE BY ID --------------------
    updateById: async (
        id: string | Types.ObjectId,
        data: UpdateQuery<IPayment>
    ): Promise<IPayment | null> => {
        return Payment.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    },

    // -------------------- UPDATE BY ORDER ID --------------------
    updateByOrderId: async (
        razorpayOrderId: string,
        data: UpdateQuery<IPayment>
    ): Promise<IPayment | null> => {
        return Payment.findOneAndUpdate({ razorpayOrderId }, data, {
            new: true,
            runValidators: true,
        });
    },

    // -------------------- MARK AS PAID --------------------
    markAsPaid: async (
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string,
        enrollmentId?: Types.ObjectId
    ): Promise<IPayment | null> => {
        return Payment.findOneAndUpdate(
            { razorpayOrderId },
            {
                razorpayPaymentId,
                razorpaySignature,
                status: PaymentStatus.PAID,
                paidAt: new Date(),
                enrollmentId,
            },
            { new: true }
        );
    },

    markAsPaidConditionally: async (
        orderId: string,
        paymentId: string,
        signature: string,
        session: any
    ) => {
        return Payment.updateOne(
            {
                razorpayOrderId: orderId,
                status: PaymentStatus.CREATED, // important
            },
            {
                $set: {
                    status: PaymentStatus.PAID,
                    razorpayPaymentId: paymentId,
                    razorpaySignature: signature,
                    paidAt: new Date(),
                },
            },
            { session }
        );
    },

    // -------------------- MARK AS FAILED --------------------
    markAsFailed: async (
        razorpayOrderId: string,
        failureReason?: string
    ): Promise<IPayment | null> => {
        return Payment.findOneAndUpdate(
            { razorpayOrderId },
            {
                status: PaymentStatus.FAILED,
                failureReason,
            },
            { new: true }
        );
    },

    // -------------------- GET USER PAYMENTS --------------------
    findByUser: async (
        userId: string | Types.ObjectId,
        query: {
            page?: number;
            limit?: number;
            status?: PaymentStatus;
        } = {}
    ) => {
        const { page = 1, limit = 10, status } = query;
        const skip = (page - 1) * limit;

        const filter: FilterQuery<IPayment> = { userId };
        if (status) filter.status = status;

        const [payments, total] = await Promise.all([
            Payment.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "courseId",
                    select: "title slug coverImage",
                })
                .lean(),
            Payment.countDocuments(filter),
        ]);

        return {
            payments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    // -------------------- GET COURSE PAYMENTS (FOR ADMIN/INSTRUCTOR) --------------------
    findByCourse: async (
        courseId: string | Types.ObjectId,
        query: {
            page?: number;
            limit?: number;
            status?: PaymentStatus;
        } = {}
    ) => {
        const { page = 1, limit = 10, status } = query;
        const skip = (page - 1) * limit;

        const filter: FilterQuery<IPayment> = { courseId };
        if (status) filter.status = status;

        const [payments, total] = await Promise.all([
            Payment.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("userId", "name email avatar")
                .lean(),
            Payment.countDocuments(filter),
        ]);

        return {
            payments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    // -------------------- GET PAYMENT STATS --------------------
    getStats: async (
        filter: FilterQuery<IPayment> = {}
    ): Promise<{ totalAmount: number; count: number }> => {
        const result = await Payment.aggregate([
            { $match: { ...filter, status: PaymentStatus.PAID } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        return result[0] || { totalAmount: 0, count: 0 };
    },

    // -------------------- CHECK EXISTING PAYMENT --------------------
    hasCompletedPayment: async (
        userId: string | Types.ObjectId,
        courseId: string | Types.ObjectId
    ): Promise<boolean> => {
        const payment = await Payment.exists({
            userId,
            courseId,
            status: PaymentStatus.PAID,
        });
        return !!payment;
    },

    // -------------------- DELETE --------------------
    deleteById: async (id: string | Types.ObjectId): Promise<IPayment | null> => {
        return Payment.findByIdAndDelete(id);
    },
};

export default paymentRepository;
