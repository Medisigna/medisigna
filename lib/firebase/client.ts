import { initializeApp, getApps, getApp } from "firebase/app"
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging"

function cleanEnv(val: string | undefined): string | undefined {
  if (!val) return undefined
  const cleaned = val.trim().replace(/^["']|["']$/g, "").replace(/,$/, "").trim()
  return cleaned.length > 0 ? cleaned : undefined
}

export function getFirebaseConfig() {
  const envApiKey = cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
  const envAppId = cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)

  if (envApiKey && envAppId) {
    return {
      apiKey: envApiKey,
      authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) || "medisigna-ce8a1.firebaseapp.com",
      projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || "medisigna-ce8a1",
      storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || "medisigna-ce8a1.firebasestorage.app",
      messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) || "807662580769",
      appId: envAppId,
    }
  }

  return {
    apiKey: "AIzaSyDH-ExDeMjFKrHfCBFJSVBCy9l8lZnH02Q",
    authDomain: "medisigna-ce8a1.firebaseapp.com",
    projectId: "medisigna-ce8a1",
    storageBucket: "medisigna-ce8a1.firebasestorage.app",
    messagingSenderId: "807662580769",
    appId: "1:807662580769:web:15b8e87f904960b4aa9f60",
  }
}

export function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(getFirebaseConfig())
  }
  return getApp()
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null
  const supported = await isSupported().catch(() => false)
  if (!supported) return null
  const app = getFirebaseApp()
  return getMessaging(app)
}

export async function requestNotificationPermissionAndGetToken(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      return null
    }

    const messaging = await getFirebaseMessaging()
    if (!messaging) return null

    const vapidKey = cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY)

    if (!vapidKey) {
      console.warn(
        "[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY belum diisi di file .env! Masukkan VAPID Key dari Firebase Console (Project Settings > Cloud Messaging > Web Push certificates) ke .env untuk mengaktifkan notifikasi push."
      )
      return null
    }

    let swRegistration: ServiceWorkerRegistration | undefined
    if ("serviceWorker" in navigator) {
      try {
        swRegistration = await navigator.serviceWorker.ready
      } catch (swErr) {
        console.warn("[FCM] Service worker belum siap:", swErr)
      }
    }

    const token = await getToken(messaging, {
      serviceWorkerRegistration: swRegistration,
      vapidKey,
    })

    return token
  } catch (error: any) {
    if (error?.message?.includes("installations/request-failed") || error?.message?.includes("INVALID_ARGUMENT")) {
      console.warn(
        "[FCM] Kredensial Firebase (apiKey / projectId / appId / messagingSenderId) tidak cocok. Pastikan seluruh variabel NEXT_PUBLIC_FIREBASE_* di file .env berasal dari proyek Firebase yang sama."
      )
    } else if (error?.name === "AbortError" || error?.message?.includes("push service error")) {
      console.warn(
        "[FCM] Push Service browser gagal merespons. Pastikan: 1) NEXT_PUBLIC_FIREBASE_VAPID_KEY di .env sudah diisi VAPID Key valid dari Firebase Console. 2) Tidak di mode Incognito/Private. 3) Koneksi/VPN tidak memblokir fcm.googleapis.com."
      )
    } else {
      console.error("[FCM] Gagal mengambil FCM token:", error)
    }
    return null
  }
}

export async function registerForegroundMessageHandler(
  onMessageReceived: (payload: { title?: string; body?: string; link?: string }) => void
) {
  const messaging = await getFirebaseMessaging()
  if (!messaging) return () => {}

  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title || payload.data?.title
    const body = payload.notification?.body || payload.data?.body
    const link = payload.data?.link

    onMessageReceived({ title, body, link })
  })
}
