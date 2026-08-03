import { saveForumCategory } from "@/app/actions/admin/moderate-forum"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { getForumCategories, type ForumCategoryItem } from "@/lib/forum"
import { requireRole } from "@/lib/session"

export const metadata = {
  title: "Kategori Forum | Medisigna",
}

export default async function AdminForumCategoriesPage() {
  await requireRole("ADMIN")
  const categories: ForumCategoryItem[] = await getForumCategories({ activeOnly: false })

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Kategori Forum</h1>
        <p className="text-sm text-muted-foreground">
          Kelola kategori yang muncul di forum diskusi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah kategori</CardTitle>
          <CardDescription>Kategori aktif langsung tersedia di composer forum.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveForumCategory} className="grid gap-4 md:grid-cols-[1fr_1.5fr_auto] md:items-end">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Nama
              <Input name="name" required />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Deskripsi
              <Textarea name="description" rows={2} />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium md:pb-2">
              <input type="checkbox" name="isActive" defaultChecked />
              Aktif
            </label>
            <div className="md:col-span-3">
              <Button type="submit">Simpan kategori</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar kategori</CardTitle>
          <CardDescription>{categories.length} kategori tersimpan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Thread</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell>{category.threadCount}</TableCell>
                  <TableCell>
                    <form action={saveForumCategory} className="grid gap-2 md:grid-cols-[1fr_1.5fr_auto_auto]">
                      <input type="hidden" name="id" value={category.id} />
                      <Input name="name" defaultValue={category.name} required />
                      <Input
                        name="description"
                        defaultValue={category.description ?? ""}
                        placeholder="Deskripsi"
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked={category.isActive}
                        />
                        Aktif
                      </label>
                      <Button type="submit" size="sm">Simpan</Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {!categories.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Belum ada kategori forum.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
