import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { VideoDetail } from "@/lib/educational-videos"

type VideoAction = (formData: FormData) => void | Promise<void>

function Field({
  children,
  label,
  required,
}: {
  children: React.ReactNode
  label: string
  required?: boolean
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      <span>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

export function VideoForm({
  cancelHref,
  categories = [],
  saveAction,
  video,
}: {
  cancelHref: string
  categories?: string[]
  saveAction: VideoAction
  video?: VideoDetail | null
}) {
  return (
    <form action={saveAction} className="flex flex-col gap-4">
      {video ? <input type="hidden" name="id" value={video.id} /> : null}
      <Card>
        <CardHeader>
          <CardTitle>Dasar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Judul" required>
            <Input name="title" defaultValue={video?.title ?? ""} aria-required />
          </Field>
          <Field label="Kategori" required>
            {categories.length ? (
              <select
                name="category"
                defaultValue={video?.category ?? ""}
                required
                aria-required
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="" disabled>
                  Pilih kategori
                </option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            ) : (
              <Input name="category" defaultValue={video?.category ?? ""} aria-required />
            )}
          </Field>
          <Field label="Link YouTube" required>
            <Input
              name="youtubeUrl"
              type="url"
              defaultValue={video?.youtubeUrl ?? ""}
              aria-required
            />
          </Field>
          <Field label="Ringkasan" required>
            <Textarea name="excerpt" defaultValue={video?.excerpt ?? ""} rows={4} aria-required />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Meta title">
            <Input name="metaTitle" defaultValue={video?.metaTitle ?? ""} />
          </Field>
          <Field label="Meta description">
            <Textarea name="metaDescription" defaultValue={video?.metaDescription ?? ""} rows={3} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button asChild variant="outline">
          <Link href={cancelHref}>Batal</Link>
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  )
}
