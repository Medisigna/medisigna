importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js")

const urlParams = new URLSearchParams(location.search)
const firebaseConfig = {
  apiKey: urlParams.get("apiKey") || "",
  authDomain: urlParams.get("authDomain") || "",
  projectId: urlParams.get("projectId") || "",
  storageBucket: urlParams.get("storageBucket") || "",
  messagingSenderId: urlParams.get("messagingSenderId") || "",
  appId: urlParams.get("appId") || "",
}

if (firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig)
  const messaging = firebase.messaging()

  messaging.onBackgroundMessage((payload) => {
    // Avoid double notification if webpush notification is already handled automatically by browser
    if (payload.notification) {
      return
    }

    const notificationTitle = payload.data?.title || "Notifikasi Medisigna"
    const notificationOptions = {
      body: payload.data?.body || "",
      icon: "/menu-icons/consult.png",
      badge: "/menu-icons/consult.png",
      data: {
        link: payload.data?.link || "/dashboard/chat",
      },
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
  })
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const link = event.notification.data?.link || "/dashboard/chat"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(link) && "focus" in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(link)
      }
    })
  )
})
