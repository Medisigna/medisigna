const requiredEnv = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
] as const

function required(name: (typeof requiredEnv)[number]) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function optional(name: string) {
  const value = process.env[name]
  return value && value.length > 0 ? value : undefined
}

function optionalNumber(name: string) {
  const value = optional(name)

  if (!value) {
    return undefined
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a number`)
  }

  return parsed
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  BETTER_AUTH_SECRET: required("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: required("BETTER_AUTH_URL"),
  NEXT_PUBLIC_APP_URL: required("NEXT_PUBLIC_APP_URL"),
  UPLOAD_MAX_SIZE_MB: optionalNumber("UPLOAD_MAX_SIZE_MB"),
  PUSH_NOTIFICATION_PUBLIC_KEY: optional("PUSH_NOTIFICATION_PUBLIC_KEY"),
  PUSH_NOTIFICATION_PRIVATE_KEY: optional("PUSH_NOTIFICATION_PRIVATE_KEY"),
  CLOUDINARY_CLOUD_NAME: optional("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: optional("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: optional("CLOUDINARY_API_SECRET"),
  STORAGE_PROVIDER: optional("STORAGE_PROVIDER"),
  STORAGE_BUCKET: optional("STORAGE_BUCKET"),
  STORAGE_ACCESS_KEY: optional("STORAGE_ACCESS_KEY"),
  STORAGE_SECRET_KEY: optional("STORAGE_SECRET_KEY"),
  GOOGLE_CLIENT_ID: optional("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: optional("GOOGLE_CLIENT_SECRET"),
  NEXT_PUBLIC_FIREBASE_API_KEY: optional("NEXT_PUBLIC_FIREBASE_API_KEY"),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: optional("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: optional("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: optional("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: optional("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  NEXT_PUBLIC_FIREBASE_APP_ID: optional("NEXT_PUBLIC_FIREBASE_APP_ID"),
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: optional("NEXT_PUBLIC_FIREBASE_VAPID_KEY"),
  FIREBASE_CLIENT_EMAIL: optional("FIREBASE_CLIENT_EMAIL"),
  FIREBASE_PRIVATE_KEY: optional("FIREBASE_PRIVATE_KEY"),
} as const
