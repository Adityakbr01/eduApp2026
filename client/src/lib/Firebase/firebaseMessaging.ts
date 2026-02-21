import { onMessage, Unsubscribe } from 'firebase/messaging';
import { getMessagingInstance } from './firebase';
import { createElement } from 'react';
import toast from 'react-hot-toast';
import NotificationToast from '@/components/ui/NotificationToast';

// Module-level variables for the singleton pattern
let activeSubscribers = 0;
let isInitializing = false;
let globalUnsubscribe: Unsubscribe | null = null;

// Deduplication cache using Set
const processedMessages = new Set<string>();
const MAX_PROCESSED_MESSAGES = 50; // Prevent memory leak by bounding cache size

/**
 * EXPLANATION: Production vs Development Behavior
 * 
 * In Development (with React StrictMode), components mount, unmount, and remount instantly. 
 * This often keeps the FCM listener alive or respawns it quickly, so `onMessage` catches the push.
 * 
 * In Production, layout transitions or backgrounding the browser can cause the `onMessage` listener
 * to briefly detach or FCM to deem the tab "inactive" even if it's visible (e.g., lacks focus).
 * When FCM thinks the app is inactive, it delegates the push to the Service Worker (`onBackgroundMessage`),
 * resulting in a native browser notification showing up even when the tab is technically open.
 * 
 * To fix this, we ensure only ONE persistent listener is active, and we enforce a strict 
 * "True Foreground" check. If the tab is visible AND focused, we show the custom toast.
 * If the tab is open but not focused (e.g., user on another monitor), we intentionally 
 * spawn a native notification so they don't miss it.
 */

/**
 * Sets up a foreground listener for Firebase Cloud Messaging.
 * Uses a reference-counted singleton pattern to ensure React StrictMode 
 * or repeated re-renders don't cause double listeners.
 * Shows a polished animated in-app toast via NotificationToast component.
 */
export const setupForegroundMessaging = async (): Promise<Unsubscribe | null> => {
    try {
        if (typeof window === 'undefined') return null;

        activeSubscribers++;

        // Creates a smart unsubscribe that only cleans up the global Firebase 
        // listener when the last component unmounts.
        const createSmartUnsubscribe = () => {
            let hasUnsubscribed = false;
            return () => {
                if (hasUnsubscribed) return;
                hasUnsubscribed = true;
                activeSubscribers--;

                if (activeSubscribers === 0 && globalUnsubscribe) {
                    globalUnsubscribe();
                    globalUnsubscribe = null;
                    isInitializing = false;
                }
            };
        };

        // If a listener is already active or setting up, just return a smart unsubscribe
        if (isInitializing || globalUnsubscribe) {
            return createSmartUnsubscribe();
        }

        isInitializing = true;

        const messaging = await getMessagingInstance();
        if (!messaging) {
            activeSubscribers--;
            isInitializing = false;
            return null;
        }

        const unsubscribe = onMessage(messaging, (payload) => {
            const title = payload.notification?.title;
            const body = payload.notification?.body;
            const url = payload.data?.url || '/';

            if (!title && !body) return;

            // 1. Deduplication logic: use Payload Message ID or generate a fallback
            const messageId = payload.messageId || `${title}-${body}-${Date.now()}`;

            if (processedMessages.has(messageId)) {
                console.log(`[FCM] Duplicate message skipped in foreground: ${messageId}`);
                return;
            }

            // Mark message as processed
            processedMessages.add(messageId);

            // 2. Prevent memory leak: Ensure the Set doesn't grow infinitely
            if (processedMessages.size > MAX_PROCESSED_MESSAGES) {
                // Remove oldest element
                const oldestMessage = processedMessages.values().next().value;
                if (oldestMessage) {
                    processedMessages.delete(oldestMessage);
                }
            }

            // 3. True Foreground Detection
            // The app is only in the "true foreground" if the document is visible AND has user focus.
            const isTrulyForeground = document.visibilityState === 'visible' && document.hasFocus();

            if (isTrulyForeground) {
                // Show custom toast
                toast.custom(
                    (t) =>
                        createElement(NotificationToast, {
                            t,
                            title: title || undefined,
                            body: body || undefined,
                            url,
                        }),
                    {
                        duration: 5000,
                        id: messageId, // Let hot-toast handle any internal deduplication too
                        position:
                            typeof window !== 'undefined' && window.innerWidth <= 768
                                ? 'bottom-center'
                                : 'top-right',
                    }
                );
            } else {
                // Tab is open but NOT focused (e.g., user is looking at another window/monitor).
                // In this case, FCM might still route the message to `onMessage` because the tab isn't 
                // completely hidden, stopping the service worker from showing a notification.
                // We MUST manually show a native notification so the user doesn't miss it.
                if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
                    navigator.serviceWorker.ready.then((registration) => {
                        registration.showNotification(title || 'New Notification', {
                            body: body || '',
                            icon: '/favicon.ico',
                            data: { url }
                        });
                    });
                }
            }
        });

        globalUnsubscribe = unsubscribe;
        isInitializing = false; // Add this to reset initialization state once successfully mounted
        return createSmartUnsubscribe();

    } catch (error) {
        console.error('Error setting up foreground messaging:', error);
        activeSubscribers--;
        isInitializing = false;
        return null;
    }
};
