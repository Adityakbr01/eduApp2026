import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "src/configs/env.js";
import { oauthService } from "src/services/auth/oauth.service.js";
import logger from "src/utils/logger.js";

// Google Strategy
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
                callbackURL: env.GOOGLE_CALLBACK_URL,
                passReqToCallback: true,
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    if (!email) {
                        return done(new Error("No email found in Google profile"), false);
                    }

                    const name = profile.displayName || "Google User";
                    const avatar = profile.photos?.[0]?.value;

                    // Delegate to the unified OAuth service
                    const user = await oauthService.handleOAuthLogin({
                        provider: "google",
                        providerId: profile.id,
                        email,
                        name,
                        avatar,
                        ip: req.ip || "Unknown IP",
                        userAgent: req.headers['user-agent'] || "Unknown Device"
                    });

                    return done(null, user);
                } catch (error) {
                    logger.error("Google OAuth Error:", error);
                    return done(error, false);
                }
            }
        )
    );
} else {
    logger.warn("⚠️  Google OAuth missing credentials. Strategy disabled.");
}

// GitHub Strategy
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: env.GITHUB_CLIENT_ID,
                clientSecret: env.GITHUB_CLIENT_SECRET,
                callbackURL: env.GITHUB_CALLBACK_URL,
                scope: ['user:email'],
                passReqToCallback: true,
            },
            async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    // SaaS Standard: Extract the primary & verified email from GitHub's payload
                    let email = profile.emails?.find((e: any) => e.primary && e.verified)?.value;

                    // Fallback to the first available if no explicitly marked primary/verified
                    if (!email) {
                        email = profile.emails?.[0]?.value;
                    }

                    if (!email) {
                        return done(new Error("No email found in GitHub profile. Please ensure email is public."), false);
                    }

                    const name = profile.displayName || profile.username || "GitHub User";
                    const avatar = profile.photos?.[0]?.value;

                    // Delegate to the unified OAuth service
                    const user = await oauthService.handleOAuthLogin({
                        provider: "github",
                        providerId: profile.id,
                        email,
                        name,
                        avatar,
                        ip: req.ip || "Unknown IP",
                        userAgent: req.headers['user-agent'] || "Unknown Device"
                    });

                    return done(null, user);
                } catch (error) {
                    logger.error("GitHub OAuth Error:", error);
                    return done(error, false);
                }
            }
        )
    );
} else {
    logger.warn("⚠️  GitHub OAuth missing credentials. Strategy disabled.");
}

export default passport;
