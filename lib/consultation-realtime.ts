import { EventEmitter } from "node:events"

import { Client } from "pg"

import { env } from "@/lib/env"

const channel = "consultation_message"

export type ConsultationRealtimeEvent = {
  type?: "refresh" | "typing"
  sessionId: string
  userIds: string[]
  userId?: string
  isTyping?: boolean
}

type RealtimeState = {
  client?: Client
  connecting?: Promise<void>
  reconnectTimer?: ReturnType<typeof setTimeout>
  emitter: EventEmitter
}

const globalForRealtime = globalThis as typeof globalThis & {
  consultationRealtime?: RealtimeState
}

const state =
  globalForRealtime.consultationRealtime ??
  {
    emitter: new EventEmitter().setMaxListeners(0),
  }

globalForRealtime.consultationRealtime = state

function scheduleReconnect() {
  state.client = undefined
  state.connecting = undefined
  if (state.reconnectTimer) return

  state.reconnectTimer = setTimeout(() => {
    state.reconnectTimer = undefined
    ensureConsultationListener().catch(console.error)
  }, 1000)
}

export async function ensureConsultationListener() {
  if (state.client) return
  if (state.connecting) return state.connecting

  state.connecting = (async () => {
    const client = new Client({ connectionString: env.DATABASE_URL })

    client.on("notification", (notification) => {
      if (notification.channel === channel && notification.payload) {
        try {
          const event = JSON.parse(notification.payload) as ConsultationRealtimeEvent
          state.emitter.emit(event.sessionId, event)
          event.userIds.forEach((userId) => state.emitter.emit(userId, event))
        } catch {
          state.emitter.emit(notification.payload)
        }
      }
    })
    client.on("error", scheduleReconnect)
    client.on("end", scheduleReconnect)

    await client.connect()
    await client.query(`LISTEN ${channel}`)
    state.client = client
  })().finally(() => {
    state.connecting = undefined
  })

  return state.connecting
}

export function publishConsultationEvent(event: ConsultationRealtimeEvent) {
  state.emitter.emit(event.sessionId, event)
  event.userIds.forEach((userId) => state.emitter.emit(userId, event))
}

export function subscribeToConsultation(
  sessionId: string,
  listener: (event: ConsultationRealtimeEvent) => void
) {
  state.emitter.on(sessionId, listener)
  return () => state.emitter.off(sessionId, listener)
}
