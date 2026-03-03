/**
 * Firebase Cloud Messaging — service worker for background push notifications.
 *
 * This file MUST live at `/public/firebase-messaging-sw.js` so the browser
 * registers it at the root scope (`/`).  Firebase Messaging SDK detects
 * this path automatically when you don't pass an explicit
 * `serviceWorkerRegistration` to `getToken()`.
 *
 * The `firebaseConfig` object below must match the values used in the
 * main app (`src/lib/firebase.ts`).  Because service-workers cannot
 * access `process.env`, we duplicate the config here as plain strings.
 *
 * ⚠️  Replace the placeholder values with your actual Firebase Web config.
 */

/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyALLixtCRzZYHtnsaCF74Z_PDzj51zN6SY',
  authDomain:        'thesis-2e701.firebaseapp.com',
  projectId:         'thesis-2e701',
  storageBucket:     'thesis-2e701.firebasestorage.app',
  messagingSenderId: '873645479511',
  appId:             '1:873645479511:web:ae12879882c87aec587512',
  measurementId:     'G-84YNXZKY63',
});

const messaging = firebase.messaging();

/**
 * Background message handler — runs when the page is not in the foreground.
 * The SDK shows a default notification automatically; this callback lets you
 * customise the notification or perform silent work.
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Background message:', payload);

  const { title, body, icon } = payload.notification ?? {};

  if (title) {
    self.registration.showNotification(title, {
      body: body ?? '',
      icon: icon ?? '/assets/icons/moldify-icon.png',
      data: payload.data,
    });
  }
});
