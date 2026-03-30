// Service Worker for Firebase Cloud Messaging in Next.js
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Helper to extract query parameters
const params = new URL(location).searchParams;
const configString = params.get('config');

if (configString) {
  try {
    const firebaseConfig = JSON.parse(decodeURIComponent(configString));
    
    // Initialize the Firebase app in the service worker
    firebase.initializeApp(firebaseConfig);
    
    // Retrieve an instance of Firebase Messaging so that it can handle background messages.
    const messaging = firebase.messaging();
    
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.notification?.title || 'Cognizance Alert';
      const notificationOptions = {
        body: payload.notification?.body,
        icon: '/globe.svg', // Default Next.js icon or use your own custom logo path
        badge: '/globe.svg',
        data: payload.data
      };
      
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (error) {
    console.error('Error initializing Firebase messaging service worker', error);
  }
}

// Needed to force the SW to update and take control immediately
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
