import { PencilIcon, PlusIcon } from "lucide-react"

import {
  saveContentCategory,
  toggleContentCategory,
} from "@/app/actions/admin/save-content-category"
import { AppMessage } from "@/components/app-message"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getContentCategories, type ContentCategory } from "@/lib/content-categories"
import { cn } from "@/lib/utils"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function StatusPill({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-2 py-1 text-xs font-medium",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      )}
    >
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  )
}

function CategoryFormDialog({ category }: { category?: ContentCategory }) {
  const formId = category ? `save-category-${category.id}` : "save-category-new"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant={category ? "outline" : "default"} size="sm">
          {category ? (
            <PencilIcon data-icon="inline-start" />
          ) : (
            <PlusIcon data-icon="inline-start" />
          )}
          {category ? "Edit" : "Tambah Kategori"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
          <DialogDescription>
            Kategori aktif akan muncul di form artikel dan video edukasi.
          </DialogDescription>
        </DialogHeader>
        <form id={formId} action={saveContentCategory} className="flex flex-col gap-2">
          {category ? <input type="hidden" name="id" value={category.id} /> : null}
          <label htmlFor={`${formId}-name`} className="text-sm font-medium">
            Nama kategori
          </label>
          <Input
            id={`${formId}-name`}
            name="name"
            defaultValue={category?.name ?? ""}
            placeholder="Contoh: Diabetes"
            required
          />
        </form>
        <DialogFooter>
          <Button type="submit" form={formId}>
            {category ? "Simpan" : "Tambah"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CategoryRow({ category }: { category: ContentCategory }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{category.name}</TableCell>
      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
      <TableCell>
        <StatusPill isActive={category.isActive} />
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          <CategoryFormDialog category={category} />
          <form action={toggleContentCategory}>
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="isActive" value={String(category.isActive)} />
            <Button type="submit" variant="ghost" size="sm">
              {category.isActive ? "Nonaktifkan" : "Aktifkan"}
            </Button>
          </form>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default async function AdminContentCategoriesPage({ searchParams }: PageProps) {
  const [params, categories] = await Promise.all([
    searchParams,
    getContentCategories(),
  ])

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <AppMessage error={params?.error} success={params?.success} />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard Admin</p>
          <h1 className="text-2xl font-semibold">Kategori Konten</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kategori aktif dipakai di form artikel dan video edukasi.
          </p>
        </div>
        <CategoryFormDialog />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>{categories.length} kategori tersimpan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length ? (
                categories.map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Belum ada kategori.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
