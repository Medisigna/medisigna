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
        className="absolute -left-1 -right-2 bottom-1 z-0 h-[0.70em] origin-left -rotate-1 rounded-xs bg-[#0878ea]/30 md:-left-3 md:-right-4 md:bottom-2"
      />
    </Component>
  )
}
