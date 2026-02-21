importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// 🔥 MUST HARDCODE (NO process.env HERE)
firebase.initializeApp({
  apiKey: "AIzaSyAQxdWxoemEM49zDSemDyD54d3KakWiI5Y",
  authDomain: "eduaapp-2026.firebaseapp.com",
  projectId: "eduaapp-2026",
  storageBucket: "eduaapp-2026.firebasestorage.app",
  messagingSenderId: "973095512276",
  appId: "1:973095512276:web:eb5b3d27567f7065caf341",
  measurementId: "G-V21FY3NZLQ",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload?.notification?.title || "New Notification";

  const notificationOptions = {
    body: payload?.notification?.body || "You have a new message.",
    icon: "/favicon.ico",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});