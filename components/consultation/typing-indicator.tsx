export function TypingIndicator({ label = "Sedang mengetik" }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-2 text-xs font-medium text-primary italic"
      role="status"
      aria-live="polite"
    >
      <span>{label}</span>
      <span className="flex gap-1" aria-hidden="true">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </span>
    </div>
  )
}
