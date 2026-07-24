"use client"

import dynamic from "next/dynamic"

const Markdown = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
)

export function MarkdownPreview({ source }: { source: string }) {
  return (
    <div data-color-mode="light">
      <Markdown className="!bg-transparent !p-0" source={source} />
    </div>
  )
}
