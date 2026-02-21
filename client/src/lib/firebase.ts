import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, Messaging } from 'firebase/messaging';


export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Detects if the current browser is Brave.
 * Brave blocks push notifications by default.
 */
const isBraveBrowser = async (): Promise<boolean> => {
    try {
        // Brave exposes navigator.brave
        return !!(navigator as any).brave && await (navigator as any).brave.isBrave();
    } catch {
        return false;
    }
};

export const requestFirebaseNotificationPermission = async (): Promise<string | null> => {
    try {
        const supported = await isSupported();
        if (!supported) {
            return null;
        }

        // Check if Brave browser — it blocks FCM push service
        const brave = await isBraveBrowser();
        if (brave) {
            throw new Error(
                "Brave browser blocks push notifications by default. Please go to brave://settings/privacy and enable 'Use Google services for push messaging', then try again."
            );
        }

        const messaging = getMessaging(app);
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;

        if (!vapidKey) {
            throw new Error("VAPID key is not defined in .env file");
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            return null;
        }

        const token = await getToken(messaging, { vapidKey });
        return token || null;
    } catch (err) {
        // Re-throw Brave-specific error so caller can show a helpful message
        if (err instanceof Error && err.message.includes('Brave')) {
            throw err;
        }
        console.error('Failed to get push notification token:', err);
        return null;
    }
};

/**
 * Safely initializes and returns the messaging instance
 * only if supported and running in the browser.
 */
export const getMessagingInstance = async (): Promise<Messaging | null> => {
    try {
        if (typeof window === 'undefined') return null;

        const supported = await isSupported();
        if (!supported) return null;

        const brave = await isBraveBrowser();
        if (brave) return null;

        return getMessaging(app);
    } catch (err) {
        console.error('Failed to get messaging instance:', err);
        return null;
    }
};

export default app;
