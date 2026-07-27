import Link from "next/link"

import { ArticleCoverUploadField } from "@/components/articles/article-cover-upload-field"
import { MarkdownEditorField } from "@/components/markdown-editor-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ArticleDetail } from "@/lib/articles"

type ArticleAction = (formData: FormData) => void | Promise<void>

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

export function ArticleForm({
  article,
  cancelHref,
  saveAction,
}: {
  article?: ArticleDetail | null
  cancelHref: string
  saveAction: ArticleAction
}) {
  return (
    <form action={saveAction} className="flex flex-col gap-4">
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      <Card>
        <CardHeader>
          <CardTitle>Dasar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Judul" required>
            <Input name="title" defaultValue={article?.title ?? ""} aria-required />
          </Field>
          <Field label="Kategori" required>
            <Input name="category" defaultValue={article?.category ?? ""} aria-required />
          </Field>
          <Field label="Ringkasan" required>
            <Textarea
              name="excerpt"
              defaultValue={article?.excerpt ?? ""}
              rows={4}
              aria-required
            />
          </Field>
          <ArticleCoverUploadField defaultValue={article?.coverImageUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Artikel</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownEditorField
            name="contentMarkdown"
            label="Isi artikel"
            defaultValue={article?.contentMarkdown}
            required
            height={420}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Meta title">
            <Input name="metaTitle" defaultValue={article?.metaTitle ?? ""} />
          </Field>
          <Field label="Meta description">
            <Textarea
              name="metaDescription"
              defaultValue={article?.metaDescription ?? ""}
              rows={3}
            />
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
