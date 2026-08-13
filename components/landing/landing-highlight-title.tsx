import type { ElementType, ReactNode } from "react"

import { cn } from "@/lib/utils"

type LandingHighlightTitleProps = {
  as?: ElementType
  children: ReactNode
  className?: string
}

export function LandingHighlightTitle({
  as: Component = "h2",
  children,
  className,
}: LandingHighlightTitleProps) {
  return (
    <Component
      className={cn(
        "group relative isolate w-fit max-w-3xl text-left text-2xl font-semibold tracking-tight text-foreground md:text-5xl",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-1 z-0 h-[0.78em] origin-left -rotate-1 rounded-xs bg-primary/50 md:bottom-2"
      />
    </Component>
  )
}
