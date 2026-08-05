import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"

import { db } from "@/lib/db"
import { env } from "@/lib/env"

function getTrustedOrigins() {
  const origins = new Set<string>()
  if (env.NEXT_PUBLIC_APP_URL) {
    origins.add(env.NEXT_PUBLIC_APP_URL)
    if (env.NEXT_PUBLIC_APP_URL.includes("://www.")) {
      origins.add(env.NEXT_PUBLIC_APP_URL.replace("://www.", "://"))
    } else {
      origins.add(env.NEXT_PUBLIC_APP_URL.replace("://", "://www."))
    }
  }
  if (env.BETTER_AUTH_URL) {
    origins.add(env.BETTER_AUTH_URL)
    if (env.BETTER_AUTH_URL.includes("://www.")) {
      origins.add(env.BETTER_AUTH_URL.replace("://www.", "://"))
    } else {
      origins.add(env.BETTER_AUTH_URL.replace("://", "://www."))
    }
  }
  return Array.from(origins)
}

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: getTrustedOrigins(),
  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "PATIENT",
      },
      status: {
        type: "string",
        required: true,
        defaultValue: "ACTIVE",
      },
    },
  },
  plugins: [nextCookies()],
})
