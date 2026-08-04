import { cn } from "@/lib/utils"

export function ForumBadge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode
  tone?: "muted" | "primary" | "category" | "warning" | "danger"
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-md border px-2 text-xs font-medium",
        tone === "primary" && "border-primary/20 bg-primary/10 text-primary",
        tone === "category" &&
          "rounded-full border-transparent bg-primary/10 text-primary",
        tone === "warning" && "border-foreground/15 bg-muted text-foreground",
        tone === "danger" && "border-destructive/20 bg-destructive/10 text-destructive",
        tone === "muted" && "bg-muted text-muted-foreground"
      )}
    >
      {children}
    </span>
  )
}
