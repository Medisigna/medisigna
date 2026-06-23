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
  STORAGE_PROVIDER: optional("STORAGE_PROVIDER"),
  STORAGE_BUCKET: optional("STORAGE_BUCKET"),
  STORAGE_ACCESS_KEY: optional("STORAGE_ACCESS_KEY"),
  STORAGE_SECRET_KEY: optional("STORAGE_SECRET_KEY"),
} as const
