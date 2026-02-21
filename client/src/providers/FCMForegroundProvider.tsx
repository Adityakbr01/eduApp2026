"use client";

import { useEffect } from "react";
import { setupForegroundMessaging } from "@/lib/Firebase/firebaseMessaging";

/**
 * This provider sets up the FCM foreground listener only on the client side.
 * It ensures proper cleanup on unmount and prevents SSR issues.
 */
export default function FCMForegroundProvider() {
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    const initFirebaseMessaging = async () => {
      const unsub = await setupForegroundMessaging();
      if (mounted && unsub) {
        unsubscribe = unsub;
      } else if (!mounted && unsub) {
        // Clean up if the component unmounted before the promise resolved
        unsub();
      }
    };

    initFirebaseMessaging();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return null; // Renders nothing
}
