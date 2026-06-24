import { CheckCheckIcon, LoaderCircleIcon, SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type ChatMessage = {
  id: string
  senderId: string
  type: "TEXT" | "IMAGE" | "SYSTEM" | "SUMMARY"
  body: string | null
  createdAt: string
  pending?: boolean
  attachments: {
    id: string
    fileUrl: string
    fileType: string
    fileName: string
  }[]
}

export function MessageBubble({
  message,
  isOwnMessage,
}: {
  message: ChatMessage
  isOwnMessage: boolean
}) {
  if (message.type === "SYSTEM") {
    return (
      <div className="flex justify-center py-1">
        <p className="inline-flex max-w-[90%] items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1.5 text-center text-xs text-muted-foreground shadow-xs backdrop-blur">
          <SparklesIcon className="size-3" aria-hidden="true" />
          {message.body}
        </p>
      </div>
    )
  }
  if (message.type === "SUMMARY") return <SummaryCard body={message.body} />

  return (
    <article
      className={cn(
        "flex animate-in fade-in slide-in-from-bottom-1 duration-200",
        isOwnMessage ? "justify-end" : "justify-start",
        message.pending && "opacity-70"
      )}
    >
      <div
        className={cn(
          "group relative max-w-[88%] overflow-hidden border px-3.5 py-2.5 text-sm break-words shadow-xs transition-shadow hover:shadow-sm sm:max-w-[82%]",
          isOwnMessage
            ? "rounded-2xl rounded-br-md border-primary/30 bg-primary text-primary-foreground"
            : "rounded-2xl rounded-bl-md bg-card text-card-foreground"
        )}
      >
        {message.attachments.map((attachment) => (
          <figure
            key={attachment.id}
            className={cn(
              "mb-2 overflow-hidden rounded-xl border bg-background/10 p-1",
              isOwnMessage ? "border-primary-foreground/15" : "border-border"
            )}
          >
            <img
              src={attachment.fileUrl}
              alt={attachment.fileName}
              className="h-auto max-h-72 max-w-full rounded-lg object-contain"
            />
          </figure>
        ))}
        {message.body ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
        ) : null}
        <p
          className={cn(
            "mt-1.5 flex items-center justify-end gap-1 text-[10px] font-medium",
            isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {message.pending ? (
            <>
              <LoaderCircleIcon className="size-3 animate-spin" aria-hidden="true" />
              Mengirim...
            </>
          ) : (
            <>
              {new Date(message.createdAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {isOwnMessage ? (
                <CheckCheckIcon className="size-3" aria-label="Terkirim" />
              ) : null}
            </>
          )}
        </p>
      </div>
    </article>
  )
}

function SummaryCard({ body }: { body: string | null }) {
  let summary: Record<string, string> = {}

  try {
    summary = body ? JSON.parse(body) : {}
  } catch {
    summary = {}
  }

  const title = summary.title ?? summary.mainProblem
  const description =
    summary.description ??
    [summary.education, summary.warning, summary.followUpAdvice]
      .filter(Boolean)
      .join("\n\n")
  const status = summary.status ?? summary.finalStatus

  return (
    <article className="rounded-md border bg-card p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{title || "Ringkasan Konseling"}</h3>
        {status === "REFERRED" ? (
          <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
            Dirujuk ke Faskes
          </span>
        ) : null}
      </div>
      <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{description}</p>
    </article>
  )
}
