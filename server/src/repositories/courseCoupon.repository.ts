import type { FilterQuery, UpdateQuery } from "mongoose";
import { Types } from "mongoose";
import CourseCoupon from "src/models/course/courseCoupon.model.js";

// ============================================
// COURSE COUPON REPOSITORY
// ============================================
export const courseCouponRepository = {
    create: async (data: any) => {
        return CourseCoupon.create(data);
    },

    findById: async (id: string | Types.ObjectId) => {
        return CourseCoupon.findById(id);
    },

    findByCode: async (code: string) => {
        return CourseCoupon.findOne({ code: code.toUpperCase() });
    },

    findValidCoupon: async (code: string) => {
        return (CourseCoupon as any).findValidCoupon(code);
    },

    findByInstructor: async (
        instructorId: string | Types.ObjectId,
        query: { page?: number; limit?: number; status?: string; search?: string } = {}
    ) => {
        const { page = 1, limit = 10, status, search } = query;
        const skip = (page - 1) * limit;

        const filter: FilterQuery<any> = { createdBy: instructorId };

        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { code: { $regex: search, $options: "i" } },
                { name: { $regex: search, $options: "i" } },
            ];
        }

        const [coupons, total] = await Promise.all([
            CourseCoupon.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("applicableCourses", "title slug pricing")
                .lean(),
            CourseCoupon.countDocuments(filter),
        ]);

        return {
            coupons,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    },

    updateById: async (id: string | Types.ObjectId, data: UpdateQuery<any>) => {
        return CourseCoupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    },

    deleteById: async (id: string | Types.ObjectId) => {
        return CourseCoupon.findByIdAndDelete(id);
    },

    updateOne: async (filter: FilterQuery<any>, update: UpdateQuery<any>, session: any) => {
        return CourseCoupon.updateOne(filter, update, { session });
    },
};
