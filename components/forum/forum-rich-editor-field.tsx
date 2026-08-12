"use client"

import { useEffect, useId, useRef, useState } from "react"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { Markdown } from "@tiptap/markdown"
import { EditorContent, useEditor, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  BoldIcon,
  Heading2Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  StrikethroughIcon,
  Trash2Icon,
} from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type MarkdownEditor = Editor & {
  getMarkdown: () => string
}

type ForumEditorAttachment = {
  id: string
  altText: string
  fileName: string
  fileUrl: string
  isInline: false
}

function editorMarkdown(editor: Editor) {
  return ((editor as MarkdownEditor).getMarkdown?.() ?? "").trim()
}

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function ToolbarButton({
  children,
  disabled,
  isActive,
  label,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  isActive?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={isActive ? "secondary" : "ghost"}
          size="icon-sm"
          aria-label={label}
          aria-pressed={isActive}
          disabled={disabled}
          className={isActive ? "shadow-xs ring-1 ring-border" : undefined}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function AttachmentFrame({
  attachment,
  onRemove,
}: {
  attachment: ForumEditorAttachment
  onRemove: (attachment: ForumEditorAttachment) => void
}) {
  return (
    <div className="group relative overflow-hidden rounded-md border bg-background">
      <img
        src={attachment.fileUrl}
        alt={attachment.altText}
        className="aspect-video w-full object-cover"
      />
      <div className="absolute inset-x-2 top-2 flex justify-end gap-2">
        <Button
          type="button"
          size="icon-sm"
          variant="destructive"
          className="shadow-md"
          aria-label="Hapus gambar"
          onClick={() => onRemove(attachment)}
        >
          <Trash2Icon data-icon="inline-start" />
        </Button>
      </div>
      <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-muted-foreground">
        <span className="truncate">{attachment.fileName}</span>
        <span>Gambar</span>
      </div>
    </div>
  )
}

export function ForumRichEditorField({
  name,
  label,
  defaultValue,
  hideLabel = false,
  initialAttachments = [],
  required,
  height = 260,
}: {
  name: string
  label: string
  defaultValue?: string | null
  hideLabel?: boolean
  initialAttachments?: ForumEditorAttachment[]
  required?: boolean
  height?: number
}) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue ?? "")
  const [attachments, setAttachments] =
    useState<ForumEditorAttachment[]>(initialAttachments)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [, setEditorStateVersion] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        autolink: true,
        defaultProtocol: "https",
        enableClickSelection: true,
        linkOnPaste: true,
        markdownLinks: true,
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Image.configure({
        allowBase64: false,
        inline: false,
      }),
      Placeholder.configure({
        placeholder: "Tulis isi diskusi...",
      }),
      Markdown,
    ],
    content: defaultValue ?? "",
    contentType: "markdown",
    editorProps: {
      attributes: {
        "aria-labelledby": id,
        "aria-multiline": "true",
        "aria-required": required ? "true" : "false",
        class: "forum-rich-editor min-h-40 px-3 py-2 text-sm leading-6 outline-none",
        role: "textbox",
        style: `min-height: ${height}px;`,
      },
    },
    immediatelyRender: false,
    onSelectionUpdate: () => setEditorStateVersion((version) => version + 1),
    onTransaction: () => setEditorStateVersion((version) => version + 1),
    onUpdate: ({ editor: nextEditor }) => {
      setValue(editorMarkdown(nextEditor))
    },
  })

  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    input.dispatchEvent(new Event("input", { bubbles: true }))
    input.dispatchEvent(new Event("change", { bubbles: true }))
  }, [value])

  function runCommand(command: (editor: Editor) => void) {
    if (!editor) return
    command(editor)
    setValue(editorMarkdown(editor))
    setEditorStateVersion((version) => version + 1)
  }

  function setLink() {
    if (!editor) return

    const previousUrl = editor.getAttributes("link").href as string | undefined
    const inputUrl = window.prompt("Masukkan link", previousUrl ?? "")
    if (inputUrl === null) return

    const href = normalizeUrl(inputUrl)
    if (!href) {
      runCommand((currentEditor) =>
        currentEditor.chain().focus().extendMarkRange("link").unsetLink().run()
      )
      return
    }

    runCommand((currentEditor) =>
      currentEditor.chain().focus().extendMarkRange("link").setLink({ href }).run()
    )
  }

  function removeAttachment(attachment: ForumEditorAttachment) {
    setAttachments((current) => current.filter((item) => item.id !== attachment.id))
  }

  async function uploadMarkdownImages(fileList?: FileList | null) {
    const files = Array.from(fileList ?? [])
    if (!files.length) return

    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    if (!imageFiles.length) {
      toast.error("File harus berupa gambar.")
      return
    }

    setIsUploadingImage(true)

    try {
      const uploadedAttachments: ForumEditorAttachment[] = []

      for (const file of imageFiles) {
        const formData = new FormData()
        formData.set("file", file)

        const response = await fetch("/api/markdown/image-upload", {
          method: "POST",
          body: formData,
        })
        const result = (await response.json()) as {
          secureUrl?: string
          error?: string
        }

        if (!response.ok || !result.secureUrl) {
          throw new Error(result.error || "Upload gambar gagal.")
        }

        const secureUrl = result.secureUrl
        const alt = file.name.replace(/\.[^/.]+$/, "") || "Gambar"
        uploadedAttachments.push({
          id: crypto.randomUUID(),
          altText: alt,
          fileName: file.name || alt,
          fileUrl: secureUrl,
          isInline: false,
        })
      }

      setAttachments((current) => [
        ...current,
        ...uploadedAttachments,
      ].slice(0, 8))
      toast.success("Gambar diupload.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload gambar gagal.")
    } finally {
      setIsUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ""
    }
  }

  const canUseToolbar = Boolean(editor)

  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <input ref={inputRef} type="hidden" name={name} value={value} readOnly />
      <input
        type="hidden"
        name="forumAttachments"
        value={JSON.stringify(attachments)}
        readOnly
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => uploadMarkdownImages(event.target.files)}
      />
      <div className="flex flex-col gap-3 rounded-md border bg-background p-3">
        {attachments.length ? (
          attachments.length > 1 ? (
            <Carousel opts={{ align: "start" }} className="px-8">
              <CarouselContent>
                {attachments.map((attachment) => (
                    <CarouselItem key={attachment.id} className="basis-1/2">
                    <AttachmentFrame
                      attachment={attachment}
                      onRemove={removeAttachment}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          ) : (
            <AttachmentFrame
              attachment={attachments[0]}
              onRemove={removeAttachment}
            />
          )
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          disabled={isUploadingImage}
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon data-icon="inline-start" />
          {isUploadingImage ? "Mengupload..." : "Tambah gambar"}
        </Button>
      </div>
      <label id={id} className={hideLabel ? "sr-only" : undefined}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      <TooltipProvider>
        <div className="overflow-hidden rounded-md border bg-background">
          <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-1">
            <ToolbarButton
              label="Heading"
              disabled={!canUseToolbar}
              isActive={editor?.isActive("heading", { level: 2 })}
              onClick={() =>
                runCommand((currentEditor) =>
                  currentEditor.chain().focus().toggleHeading({ level: 2 }).run()
                )
              }
            >
              <Heading2Icon data-icon="inline-start" />
            </ToolbarButton>
            <ToolbarButton
              label="Tebal"
              disabled={!canUseToolbar}
              isActive={editor?.isActive("bold")}
              onClick={() =>
                runCommand((currentEditor) => currentEditor.chain().focus().toggleBold().run())
              }
            >
              <BoldIcon data-icon="inline-start" />
            </ToolbarButton>
            <ToolbarButton
              label="Miring"
              disabled={!canUseToolbar}
              isActive={editor?.isActive("italic")}
              onClick={() =>
                runCommand((currentEditor) => currentEditor.chain().focus().toggleItalic().run())
              }
            >
              <ItalicIcon data-icon="inline-start" />
            </ToolbarButton>
            <ToolbarButton
              label="Coret"
              disabled={!canUseToolbar}
              isActive={editor?.isActive("strike")}
              onClick={() =>
                runCommand((currentEditor) => currentEditor.chain().focus().toggleStrike().run())
              }
            >
              <StrikethroughIcon data-icon="inline-start" />
            </ToolbarButton>
            <ToolbarButton
              label="Kutipan"
              disabled={!canUseToolbar}
              isActive={editor?.isActive("blockquote")}
              onClick={() =>
                runCommand((currentEditor) =>
                  currentEditor.chain().focus().toggleBlockquote().run()
                )
              }
            >
              <QuoteIcon data-icon="inline-start" />
            </ToolbarButton>
            <ToolbarButton
              label="Daftar poin"
              disabled={!canUseToolbar}
              isActive={editor?.isActive("bulletList")}
              onClick={() =>
                runCommand((currentEditor) =>
                  currentEditor.chain().focus().toggleBulletList().run()
                )
              }
            >
              <ListIcon data-icon="inline-start" />
            </ToolbarButton>
            <ToolbarButton
              label="Daftar angka"
              disabled={!canUseToolbar}
              isActive={editor?.isActive("orderedList")}
              onClick={() =>
                runCommand((currentEditor) =>
                  currentEditor.chain().focus().toggleOrderedList().run()
                )
              }
            >
              <ListOrderedIcon data-icon="inline-start" />
            </ToolbarButton>
            <ToolbarButton
              label="Link"
              disabled={!canUseToolbar}
              isActive={editor?.isActive("link")}
              onClick={setLink}
            >
              <LinkIcon data-icon="inline-start" />
            </ToolbarButton>
          </div>
          <EditorContent editor={editor} />
        </div>
      </TooltipProvider>
    </div>
  )
}
