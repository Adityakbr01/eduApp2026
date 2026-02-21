import { type App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";
import logger from "src/utils/logger.js";
import { env } from "./env.js";

let firebaseApp: App | null = null;
let messagingInstance: Messaging | null = null;

export const initializeFirebase = (): void => {
    if (firebaseApp) return;

    const {
        FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY,
    } = env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
        logger.warn("⚠️ Firebase config missing. Push disabled.");
        return;
    }

    firebaseApp =
        getApps().length > 0
            ? getApp()
            : initializeApp({
                credential: cert({
                    projectId: FIREBASE_PROJECT_ID,
                    clientEmail: FIREBASE_CLIENT_EMAIL,
                    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
                }),
            });

    messagingInstance = getMessaging(firebaseApp);
    logger.info("🔥 Firebase Admin SDK initialized");
};

export const getFcmMessaging = (): Messaging => {
    if (!messagingInstance) {
        throw new Error("Firebase not initialized");
    }
    return messagingInstance;
};