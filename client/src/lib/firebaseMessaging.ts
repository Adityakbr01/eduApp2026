import { onMessage, Unsubscribe } from 'firebase/messaging';
import { getMessagingInstance } from './firebase';
import { createElement } from 'react';
import toast from 'react-hot-toast';
import NotificationToast from '@/components/ui/NotificationToast';

/**
 * Sets up a foreground listener for Firebase Cloud Messaging.
 * Shows a polished animated in-app toast via NotificationToast component.
 */
export const setupForegroundMessaging = async (): Promise<Unsubscribe | null> => {
    try {
        const messaging = await getMessagingInstance();
        if (!messaging) return null;

        const unsubscribe = onMessage(messaging, (payload) => {
            const title = payload.notification?.title;
            const body = payload.notification?.body;
            const url = payload.data?.url || '/';

            if (!title && !body) return;

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
                    id: payload.messageId || Date.now().toString(),
                    position:
                        typeof window !== 'undefined' && window.innerWidth <= 768
                            ? 'bottom-center'
                            : 'top-right',
                }
            );
        });

        return unsubscribe;
    } catch (error) {
        console.error('Error setting up foreground messaging:', error);
        return null;
    }
};
