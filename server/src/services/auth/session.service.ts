import cacheInvalidation from "src/cache/cacheInvalidation.js";
import { ERROR_CODE } from "src/constants/errorCodes.js";
import { ROLES } from "src/constants/roles.js";
import { STATUSCODE } from "src/constants/statusCodes.js";
import AppError from "src/utils/AppError.js";
import { authRepository } from "src/repositories/auth.repository.js";
import { default as sessionCache, default as userCache } from "src/cache/userCache.js";
import { enrollmentService } from "src/services/enrollment.service.js";
import { getCdnUrl } from "src/utils/s3KeyGenerator.js";

export const sessionService = {
    // ============================
    // LOGOUT
    // ============================
    logoutUserService: async (userId: string) => {
        await cacheInvalidation.invalidateUserEverything(userId);
        return { message: "Logout successful" };
    },
    // ============================
    // CURRENT USER
    // ============================
    getCurrentUserService: async (req: any) => {
        const userId = req.user.id;
        const cachedUser = await sessionCache.getUserProfile(userId);
        if (cachedUser) {
            return { user: cachedUser };
        }

        const user =
            await authRepository.findUserMinimalById(userId);

        if (!user) {
            throw new AppError(
                "User not found",
                STATUSCODE.NOT_FOUND, ERROR_CODE.NOT_FOUND, [{ path: 'email', message: 'User with this email does not exist' }]
            );
        }

        const customPermissions = await userCache.getCustomPermissions(String(user._id));
        const rolePermissions = await userCache.getRolePermissions(String(user._id));
        const EffectivePermissions = await userCache.getEffectivePermissions(String(user._id));


        let enrolledCourses = [];
        //Featch enrolled courses if student
        if (user.roleId.name === ROLES.STUDENT.code) {
            enrolledCourses = await enrollmentService.getEnrolmentCoursesIds(userId);
        }

        // Build avatar URL from profile.avatar if exists
        const profile = (user as any).profile || {};
        const avatarUrl = profile.avatar?.key
            ? `${getCdnUrl(profile.avatar.key)}`
            : (user as any).avatar || undefined;

        const responseUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            roleId: user.roleId._id,
            roleName: user.roleId.name,
            approvalStatus: user.approvalStatus,
            isEmailVerified: user.isEmailVerified,
            isBanned: user.isBanned,
            customPermissions,
            rolePermissions,
            EffectivePermissions,
            phone: user.phone,
            address: (user as any).address,
            avatar: avatarUrl,
            enrolledCourses: enrolledCourses,
            // Profile data
            profile: {
                firstName: profile.firstName,
                lastName: profile.lastName,
                dateOfBirth: profile.dateOfBirth?.toISOString?.()?.split('T')[0] || profile.dateOfBirth,
                bio: profile.bio,
                city: profile.city,
                state: profile.state,
                country: profile.country,
                profession: profile.profession,
                organization: profile.organization,
                linkedinUrl: profile.linkedinUrl,
                githubUrl: profile.githubUrl,
                avatarVersion: profile.avatar?.version,
                // Resume info
                hasResume: !!profile.resume?.key,
                resumeFilename: profile.resume?.key ? profile.resume.key.split('/').pop() : undefined,
                resumeVersion: profile.resume?.version,
                resumeUrl: getCdnUrl(profile.resume?.key || "") || undefined,
                resumeName: profile.resume?.originalFilename || undefined,
            },
            professionalProfile: (user as any).instructorProfile || (user as any).managerProfile || (user as any).supportTeamProfile || undefined,
        };

        await sessionCache.createUserProfile(userId, responseUser);

        return { user: responseUser };
    },

    getSessionInfoService: async (req: any) => ({
        id: req.user.id,
        roleId: req.user.roleId,
        roleName: req.user.roleName,
        sessionId: req.user.sessionId,
        isAuthenticated: true,
    }),
};
