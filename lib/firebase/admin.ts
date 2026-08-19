import { getApps, initializeApp, cert } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"

function formatPrivateKey(rawKey: string | undefined): string | undefined {
  if (!rawKey) return undefined
  let key = rawKey.trim()

  // Strip surrounding quotes if present (e.g. from Vercel / Railway / .env)
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim()
  }

  // Replace literal \n characters with actual newlines
  key = key.replace(/\\n/g, "\n")

  // Ensure header and footer PEM tags are separated by newlines
  if (key.includes("-----BEGIN PRIVATE KEY-----") && !key.includes("\n")) {
    key = key
      .replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
      .replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----\n")
  }

  return key
}

function getAdminApp() {
  const apps = getApps()
  if (apps.length > 0) {
    return apps[0]!
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY
  const privateKey = formatPrivateKey(rawPrivateKey)

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("[Firebase Admin] Kredensial Firebase Service Account di .env belum lengkap. Push notification tidak dapat dikirim.")
    return null
  }

  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    console.warn(
      "[Firebase Admin] FIREBASE_PRIVATE_KEY di .env bukan format RSA Private Key valid (harus diawali '-----BEGIN PRIVATE KEY-----')."
    )
    return null
  }

  try {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  } catch (err) {
    console.error("[Firebase Admin] Gagal menginisialisasi Firebase Admin SDK:", err)
    return null
  }
}

export function getAdminMessaging() {
  const app = getAdminApp()
  if (!app) return null
  return getMessaging(app)
}
