import { cn } from "@/lib/utils"

export function BrandLogo({
  className,
  imageClassName,
}: {
  className?: string
  imageClassName?: string
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white shadow-xs",
        className
      )}
    >
      <img
        src="/brand/brand.png"
        alt=""
        aria-hidden="true"
        className={cn("size-full object-contain", imageClassName)}
      />
    </span>
  )
}
