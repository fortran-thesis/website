/**
 * useFCM — React hook for Firebase Cloud Messaging on the web.
 *
 * Responsibilities:
 *  1. Request notification permission from the browser.
 *  2. Obtain (or refresh) the FCM registration token.
 *  3. Register the token with the API via `POST /notification/device-token`.
 *  4. Listen for foreground push messages and surface them to the caller.
 *
 * Usage:
 *   const { fcmToken, latestMessage } = useFCM();
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { getFirebaseApp } from '@/lib/firebase';
import { registerDeviceToken } from '@/hooks/swr/use-notifications';

/** VAPID key for web push — set via NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env.local */
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '';

export interface UseFCMReturn {
  /** Current FCM registration token (null until obtained). */
  fcmToken: string | null;
  /** The most recent foreground message payload. */
  latestMessage: MessagePayload | null;
  /** Whether the browser supports notifications and permission is granted. */
  isSupported: boolean;
  /** Request permission + obtain token manually (called automatically on mount). */
  requestPermission: () => Promise<string | null>;
}

export function useFCM(): UseFCMReturn {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [latestMessage, setLatestMessage] = useState<MessagePayload | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const inFlightRef = useRef<Promise<string | null> | null>(null);

  /* ── helpers ────────────────────────────────────────────── */

  const requestPermission = useCallback(async (): Promise<string | null> => {
    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    inFlightRef.current = (async () => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return null;
      if (!VAPID_KEY) {
        console.warn('[FCM] Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY; skipping token registration');
        return null;
      }
      if (!('serviceWorker' in navigator) || !window.isSecureContext) {
        console.warn('[FCM] Service worker or secure context unavailable for web push');
        return null;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('[FCM] Notification permission denied');
        return null;
      }

      const app = getFirebaseApp();
      const messaging = getMessaging(app);
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        setFcmToken(token);
        setIsSupported(true);

        // Register with backend (fire-and-forget)
        registerDeviceToken(token, 'web').catch((err) =>
          console.error('[FCM] Failed to register device token:', err),
        );
      }

      return token;
    } catch (err) {
      console.error('[FCM] Error requesting permission / token:', err);
      return null;
    } finally {
      inFlightRef.current = null;
    }
    })();

    return inFlightRef.current;
  }, []);

  /* ── initialise on mount ────────────────────────────────── */

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    // Only auto-request when permission was previously granted
    if (Notification.permission === 'granted') {
      requestPermission();
    }

    // Set up foreground listener
    try {
      const app = getFirebaseApp();
      const messaging = getMessaging(app);

      unsubRef.current = onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground message:', payload);
        setLatestMessage(payload);
      });
    } catch {
      // messaging not supported (e.g. SSR / non-secure context)
    }

    return () => {
      unsubRef.current?.();
    };
  }, [requestPermission]);

  return { fcmToken, latestMessage, isSupported, requestPermission };
}
