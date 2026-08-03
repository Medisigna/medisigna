import Link from "next/link"
import { LockIcon, PinIcon } from "lucide-react"

import { moderateForum } from "@/app/actions/admin/moderate-forum"
import { ForumBadge } from "@/components/forum/forum-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  forumReportStatusLabels,
  forumThreadStatusLabels,
  getForumReports,
  getForumThreads,
  type ForumReportItem,
  type ForumThreadListItem,
} from "@/lib/forum"
import { requireRole } from "@/lib/session"

export const metadata = {
  title: "Moderasi Forum | Medisigna",
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export default async function AdminForumPage() {
  await requireRole("ADMIN")
  const [{ threads }, reports]: [
    { threads: ForumThreadListItem[]; total: number },
    ForumReportItem[],
  ] = await Promise.all([
    getForumThreads({ includeHidden: true, limit: 50 }),
    getForumReports({ status: "OPEN" }),
  ])

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Moderasi Forum</h1>
          <p className="text-sm text-muted-foreground">
            Kelola diskusi, laporan, dan status thread.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/forum/kategori">Kategori forum</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Laporan terbuka</CardTitle>
          <CardDescription>{reports.length} laporan menunggu keputusan.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Konten</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="max-w-72">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">
                        {report.threadTitle ?? "Konten forum"}
                      </span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {report.targetType === "POST"
                          ? report.postExcerpt
                          : report.threadSlug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{report.reporterName}</TableCell>
                  <TableCell className="max-w-64">
                    <span className="line-clamp-2 text-muted-foreground">{report.reason}</span>
                  </TableCell>
                  <TableCell>{forumReportStatusLabels[report.status]}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <form action={moderateForum} className="flex gap-2">
                        <input type="hidden" name="targetType" value="REPORT" />
                        <input type="hidden" name="id" value={report.id} />
                        <input type="hidden" name="action" value="resolve" />
                        <Input name="resolutionNote" placeholder="Catatan" />
                        <Button type="submit" size="sm">Selesai</Button>
                      </form>
                      <form action={moderateForum} className="flex gap-2">
                        <input type="hidden" name="targetType" value="REPORT" />
                        <input type="hidden" name="id" value={report.id} />
                        <input type="hidden" name="action" value="dismiss" />
                        <Button type="submit" size="sm" variant="outline">Tolak</Button>
                      </form>
                      {report.targetType === "POST" && report.postId ? (
                        <form action={moderateForum} className="flex gap-2">
                          <input type="hidden" name="targetType" value="POST" />
                          <input type="hidden" name="id" value={report.postId} />
                          <input type="hidden" name="action" value="hide" />
                          <Input name="reason" placeholder="Alasan hide" required />
                          <Button type="submit" size="sm" variant="destructive">Hide post</Button>
                        </form>
                      ) : null}
                      {report.targetType === "THREAD" && report.threadId ? (
                        <form action={moderateForum} className="flex gap-2">
                          <input type="hidden" name="targetType" value="THREAD" />
                          <input type="hidden" name="id" value={report.threadId} />
                          <input type="hidden" name="action" value="hide" />
                          <Input name="reason" placeholder="Alasan hide" required />
                          <Button type="submit" size="sm" variant="destructive">Hide thread</Button>
                        </form>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!reports.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Belum ada laporan terbuka.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thread forum</CardTitle>
          <CardDescription>{threads.length} thread terbaru.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Update</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {threads.map((thread) => (
                <TableRow key={thread.id}>
                  <TableCell className="max-w-80">
                    <div className="flex flex-col gap-1">
                      <Link href={`/admin/forum/${thread.slug}`} className="font-medium hover:underline">
                        {thread.title}
                      </Link>
                      <div className="flex flex-wrap gap-1">
                        {thread.isPinned ? <ForumBadge tone="primary"><PinIcon aria-hidden="true" /> Pin</ForumBadge> : null}
                        {thread.status === "LOCKED" ? <ForumBadge tone="warning"><LockIcon aria-hidden="true" /> Dikunci</ForumBadge> : null}
                        {thread.reportCount > 0 ? <ForumBadge tone="danger">{thread.reportCount} laporan</ForumBadge> : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{forumThreadStatusLabels[thread.status]}</TableCell>
                  <TableCell>{thread.categoryName}</TableCell>
                  <TableCell>{formatDate(thread.lastPostAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        <form action={moderateForum}>
                          <input type="hidden" name="targetType" value="THREAD" />
                          <input type="hidden" name="id" value={thread.id} />
                          <input type="hidden" name="action" value={thread.isPinned ? "unpin" : "pin"} />
                          <Button type="submit" size="sm" variant="outline">
                            {thread.isPinned ? "Unpin" : "Pin"}
                          </Button>
                        </form>
                        <form action={moderateForum}>
                          <input type="hidden" name="targetType" value="THREAD" />
                          <input type="hidden" name="id" value={thread.id} />
                          <input type="hidden" name="action" value={thread.status === "LOCKED" ? "unlock" : "lock"} />
                          <Button type="submit" size="sm" variant="outline">
                            {thread.status === "LOCKED" ? "Buka" : "Kunci"}
                          </Button>
                        </form>
                        {thread.status === "HIDDEN" ? (
                          <form action={moderateForum}>
                            <input type="hidden" name="targetType" value="THREAD" />
                            <input type="hidden" name="id" value={thread.id} />
                            <input type="hidden" name="action" value="restore" />
                            <Button type="submit" size="sm">Restore</Button>
                          </form>
                        ) : null}
                      </div>
                      {thread.status !== "HIDDEN" ? (
                        <form action={moderateForum} className="flex gap-2">
                          <input type="hidden" name="targetType" value="THREAD" />
                          <input type="hidden" name="id" value={thread.id} />
                          <input type="hidden" name="action" value="hide" />
                          <Input name="reason" placeholder="Alasan hide" required />
                          <Button type="submit" size="sm" variant="destructive">Hide</Button>
                        </form>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
