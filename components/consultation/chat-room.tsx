"use client"

import {
  ChangeEvent,
  FormEvent,
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useOptimistic,
  useRef,
  useState,
} from "react"
import { CameraIcon, ImagePlusIcon, PlusIcon, SendIcon, XIcon } from "lucide-react"
import toast from "react-hot-toast"

import { sendConsultationMessage } from "@/app/actions/consultation/send-message"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { MessageBubble, type ChatMessage } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"

const finalStatuses = ["COMPLETED", "REFERRED", "CANCELED"]

export function ChatRoom({
  sessionId,
  currentUserId,
  currentUserRole,
  counterpartName,
  initialMessages,
  sessionStatus,
  className,
}: {
  sessionId: string
  currentUserId: string
  currentUserRole: "PATIENT" | "PHARMACIST"
  counterpartName: string
  initialMessages: ChatMessage[]
  sessionStatus: string
  className?: string
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [status, setStatus] = useState(sessionStatus)
  const [text, setText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [attachmentName, setAttachmentName] = useState("")
  const [attachmentPreview, setAttachmentPreview] = useState("")
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (currentMessages, message: ChatMessage) => [...currentMessages, message]
  )
  const imageInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const isSendingRef = useRef(false)
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const remoteTypingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const lastTypingSentAtRef = useRef(0)
  const disabled = finalStatuses.includes(status)

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/consultation/sessions/${sessionId}/messages`, {
        cache: "no-store",
      })
      if (!response.ok) return
      const data = await response.json()
      startTransition(() => {
        setStatus(data.session.status)
        setMessages(data.messages)
      })
      await fetch(`/api/consultation/sessions/${sessionId}/read`, {
        method: "POST",
      })
    } catch {
      // EventSource retries automatically.
    }
  }, [sessionId])

  useEffect(() => {
    const events = new EventSource(`/api/consultation/sessions/${sessionId}/events`)
    const refresh = () => {
      if (!isSendingRef.current) fetchMessages()
    }
    events.onopen = refresh
    events.onmessage = (message) => {
      if (message.data === "refresh") {
        refresh()
        return
      }

      let event: { type?: string; isTyping?: boolean }
      try {
        event = JSON.parse(message.data)
      } catch {
        refresh()
        return
      }
      if (event.type !== "typing") {
        refresh()
        return
      }

      clearTimeout(remoteTypingTimerRef.current)
      setIsOtherTyping(event.isTyping === true)
      if (event.isTyping) {
        remoteTypingTimerRef.current = setTimeout(() => setIsOtherTyping(false), 2500)
      }
    }
    return () => {
      events.close()
      clearTimeout(remoteTypingTimerRef.current)
    }
  }, [fetchMessages, sessionId])

  useEffect(() => {
    return () => {
      if (attachmentPreview) URL.revokeObjectURL(attachmentPreview)
      clearTimeout(typingStopTimerRef.current)
    }
  }, [attachmentPreview])

  useLayoutEffect(() => {
    const container = messagesRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [sessionId])

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [optimisticMessages.length, isOtherTyping])

  function clearAttachment() {
    setAttachmentName("")
    setAttachmentPreview("")
    setAttachmentFile(null)
    if (imageInputRef.current) imageInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  function selectAttachment(file?: File) {
    setAttachmentFile(file ?? null)
    setAttachmentName(file?.name ?? "")
    setAttachmentPreview(file ? URL.createObjectURL(file) : "")
  }

  function sendTyping(isTyping: boolean) {
    fetch(`/api/consultation/sessions/${sessionId}/typing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isTyping }),
      keepalive: true,
    }).catch(() => {})
  }

  function onTextChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const value = event.target.value
    setText(value)
    clearTimeout(typingStopTimerRef.current)

    if (!value.trim()) {
      sendTyping(false)
      return
    }

    const now = Date.now()
    if (now - lastTypingSentAtRef.current > 1000) {
      lastTypingSentAtRef.current = now
      sendTyping(true)
    }
    typingStopTimerRef.current = setTimeout(() => sendTyping(false), 1500)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled || isSending) return

    const form = event.currentTarget
    const body = text.trim()
    const formData = new FormData(form)
    const hasImage = attachmentFile && attachmentFile.size > 0
    if (!body && !hasImage) {
      toast.error("Pesan tidak boleh kosong.")
      return
    }

    isSendingRef.current = true
    setIsSending(true)
    clearTimeout(typingStopTimerRef.current)
    sendTyping(false)
    formData.set("body", body)
    if (attachmentFile) formData.set("image", attachmentFile)

    const optimisticId = `optimistic-${crypto.randomUUID()}`
    const preview = attachmentPreview
    const file = attachmentFile

    startTransition(async () => {
      addOptimisticMessage({
        id: optimisticId,
        senderId: currentUserId,
        type: file ? "IMAGE" : "TEXT",
        body: body || null,
        createdAt: new Date().toISOString(),
        pending: true,
        attachments: preview
          ? [
              {
                id: `${optimisticId}-attachment`,
                fileUrl: preview,
                fileType: file?.type ?? "image/*",
                fileName: file?.name ?? "Gambar",
              },
            ]
          : [],
      })

      try {
        const result = await sendConsultationMessage(formData)

        if (!result.ok) {
          toast.error(result.error ?? "Pesan gagal dikirim.")
          return
        }

        await fetchMessages()
        setText("")
        clearAttachment()
        setAttachmentMenuOpen(false)
        form.reset()
      } finally {
        isSendingRef.current = false
        setIsSending(false)
      }
    })
  }

  return (
    <section
      className={cn(
        "flex min-h-0 overflow-hidden rounded-lg border bg-card shadow-xs",
        className
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        
        <div
          ref={messagesRef}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain bg-muted/20 p-3 sm:p-4"
        >
          {optimisticMessages.length ? (
            optimisticMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={
                  message.type === "SYSTEM"
                    ? {
                        ...message,
                        body:
                          currentUserRole === "PATIENT"
                            ? `Halo, kamu terhubung dengan ${counterpartName}. Silakan tulis pertanyaan atau upload foto obat/resep. Apoteker akan menanyakan data tambahan jika diperlukan.`
                            : `Halo, Anda terhubung dengan pasien ${counterpartName}. Silakan mulai konseling dan tanyakan data tambahan jika diperlukan.`,
                      }
                    : message
                }
                isOwnMessage={message.senderId === currentUserId}
              />
            ))
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="rounded-full border bg-card px-4 py-2 text-center text-sm text-muted-foreground">
                Belum ada pesan.
              </p>
            </div>
          )}
          {isOtherTyping ? (
            <div className="w-fit rounded-2xl rounded-bl-md bg-muted px-3 py-2">
              <TypingIndicator />
            </div>
          ) : null}
        </div>
        <form
          onSubmit={onSubmit}
          className="flex shrink-0 flex-col gap-2 border-t bg-card/95 px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur sm:gap-3 sm:p-3"
        >
          <input type="hidden" name="sessionId" value={sessionId} />
          {attachmentPreview ? (
            <div className="relative w-fit max-w-full rounded-lg border bg-muted/30 p-2">
              <img
                src={attachmentPreview}
                alt={`Preview ${attachmentName}`}
                className="max-h-36 max-w-full rounded-md object-contain"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="absolute top-3 right-3 shadow-sm"
                aria-label="Hapus gambar"
                onClick={clearAttachment}
              >
                <XIcon />
              </Button>
              <p className="mt-2 max-w-64 truncate text-xs text-muted-foreground">
                {attachmentName}
              </p>
            </div>
          ) : null}
          <div className="flex min-w-0 items-end gap-2">
            <div className="relative shrink-0">
              {attachmentMenuOpen ? (
                <div className="absolute bottom-full left-0 mb-2 w-44 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      imageInputRef.current?.click()
                      setAttachmentMenuOpen(false)
                    }}
                  >
                    <ImagePlusIcon data-icon="inline-start" />
                    Unggah gambar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      cameraInputRef.current?.click()
                      setAttachmentMenuOpen(false)
                    }}
                  >
                    <CameraIcon data-icon="inline-start" />
                    Ambil foto
                  </Button>
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                disabled={disabled || isSending}
                aria-label="Tambah lampiran"
                aria-expanded={attachmentMenuOpen}
                onClick={() => setAttachmentMenuOpen((open) => !open)}
              >
                <PlusIcon />
              </Button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={disabled || isSending}
                className="sr-only"
                onChange={(event) => selectAttachment(event.target.files?.[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                disabled={disabled || isSending}
                className="sr-only"
                onChange={(event) => selectAttachment(event.target.files?.[0])}
              />
            </div>
            <Textarea
              name="body"
              value={text}
              onChange={onTextChange}
              disabled={disabled || isSending}
              placeholder={disabled ? "Sesi sudah selesai" : "Tulis pesan..."}
              className="max-h-28 min-h-11 resize-none rounded-lg bg-background"
            />
            <Button type="submit" disabled={disabled || isSending} size="icon-lg" aria-label="Kirim pesan">
              <SendIcon data-icon="inline-start" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
