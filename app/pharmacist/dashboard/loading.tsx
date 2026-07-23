import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center">
      <Spinner className="size-6" />
    </div>
  )
}
