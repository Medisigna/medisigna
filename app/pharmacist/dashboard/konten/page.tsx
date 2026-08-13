import Link from "next/link"
import type { ReactNode } from "react"
import {
  EyeIcon,
  NewspaperIcon,
  PencilIcon,
  PillIcon,
  PlusIcon,
  VideoIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  articleStatusLabels,
  getArticles,
  type ArticleListItem,
  type ArticleStatus,
} from "@/lib/articles"
import { db } from "@/lib/db"
import type { DrugStatus } from "@/lib/drugs"
import {
  getVideos,
  videoStatusLabels,
  type VideoListItem,
  type VideoStatus,
} from "@/lib/educational-videos"
import { requireRole } from "@/lib/session"
import { cn } from "@/lib/utils"

type DrugSubmission = {
  id: string
  genericName: string
  status: DrugStatus
  adminNote: string | null
  revisesDrugId: string | null
  updatedAt: Date
}

const contentTypes = [
  {
    value: "obat",
    title: "Informasi Obat",
    description: "Monografi obat untuk Kamus Obat.",
    href: "/pharmacist/dashboard/tulis-obat",
    newHref: "/pharmacist/dashboard/tulis-obat/new",
    action: "Obat",
    tabLabel: "Obat",
    icon: PillIcon,
  },
  {
    value: "artikel",
    title: "Artikel Edukasi",
    description: "Artikel kesehatan untuk pasien.",
    href: "/pharmacist/dashboard/tulis-artikel",
    newHref: "/pharmacist/dashboard/tulis-artikel/new",
    action: "Artikel",
    tabLabel: "Artikel",
    icon: NewspaperIcon,
  },
  {
    value: "video",
    title: "Video Edukasi",
    description: "Konten video dari link YouTube.",
    href: "/pharmacist/dashboard/tulis-video",
    newHref: "/pharmacist/dashboard/tulis-video/new",
    action: "Video",
    tabLabel: "Video",
    icon: VideoIcon,
  },
] as const

function formatDate(date: Date | null) {
  if (!date) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Makassar",
  }).format(date)
}

function statusTone(status: DrugStatus | ArticleStatus | VideoStatus) {
  if (status === "PUBLISHED") return "primary"
  if (status === "REJECTED") return "destructive"
  return "secondary"
}

function StatusPill({
  children,
  status,
}: {
  children: ReactNode
  status: DrugStatus | ArticleStatus | VideoStatus
}) {
  const tone = statusTone(status)

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-2 py-1 text-xs font-medium",
        tone === "primary"
          ? "bg-primary text-primary-foreground"
          : tone === "destructive"
            ? "bg-destructive text-destructive-foreground"
            : "bg-secondary text-secondary-foreground"
      )}
    >
      {children}
    </span>
  )
}

function drugStatusLabel(submission: DrugSubmission) {
  if (submission.revisesDrugId && submission.status === "DRAFT") {
    return "Revisi menunggu"
  }

  if (submission.revisesDrugId && submission.status === "REJECTED") {
    return "Revisi ditolak"
  }

  if (submission.status === "PUBLISHED") return "Diterima"
  if (submission.status === "REJECTED") return "Ditolak"
  if (submission.status === "ARCHIVED") return "Diarsipkan"
  return "Menunggu"
}

function ContentActions({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button asChild>
        <Link href={href}>
          <PlusIcon data-icon="inline-start" />
          {label}
        </Link>
      </Button>
    </div>
  )
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-8 text-center text-muted-foreground">
        {label}
      </TableCell>
    </TableRow>
  )
}

function DrugList({ submissions }: { submissions: DrugSubmission[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama obat</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Catatan admin</TableHead>
            <TableHead>Update</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length ? (
            submissions.map((drug) => (
              <TableRow key={drug.id}>
                <TableCell className="font-medium">{drug.genericName}</TableCell>
                <TableCell>
                  <StatusPill status={drug.status}>
                    {drugStatusLabel(drug)}
                  </StatusPill>
                </TableCell>
                <TableCell className="max-w-sm text-muted-foreground">
                  {drug.adminNote || "-"}
                </TableCell>
                <TableCell>{formatDate(drug.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button asChild variant="outline" size="icon-sm" aria-label="Preview">
                      <Link href={`/pharmacist/dashboard/tulis-obat/${drug.id}`}>
                        <EyeIcon />
                      </Link>
                    </Button>
                    {drug.status === "REJECTED" ? (
                      <Button asChild variant="destructive" size="icon-sm" aria-label="Perbaiki">
                        <Link href={`/pharmacist/dashboard/tulis-obat/${drug.id}/edit`}>
                          <PencilIcon />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <EmptyRow colSpan={5} label="Belum ada tulisan obat." />
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function ArticleList({ articles }: { articles: ArticleListItem[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Update</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.length ? (
            articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.category}</TableCell>
                <TableCell>
                  <StatusPill status={article.status}>
                    {articleStatusLabels[article.status]}
                  </StatusPill>
                </TableCell>
                <TableCell>{formatDate(article.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button asChild variant="outline" size="icon-sm" aria-label="Preview">
                      <Link href={`/pharmacist/dashboard/tulis-artikel/${article.id}`}>
                        <EyeIcon />
                      </Link>
                    </Button>
                    {article.status === "REJECTED" ? (
                      <Button asChild variant="destructive" size="icon-sm" aria-label="Perbaiki">
                        <Link href={`/pharmacist/dashboard/tulis-artikel/${article.id}/edit`}>
                          <PencilIcon />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <EmptyRow colSpan={5} label="Belum ada artikel." />
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function VideoList({ videos }: { videos: VideoListItem[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Update</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.length ? (
            videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="font-medium">{video.title}</TableCell>
                <TableCell>{video.category}</TableCell>
                <TableCell>
                  <StatusPill status={video.status}>
                    {videoStatusLabels[video.status]}
                  </StatusPill>
                </TableCell>
                <TableCell>{formatDate(video.updatedAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button asChild variant="outline" size="icon-sm" aria-label="Preview">
                      <Link href={`/pharmacist/dashboard/tulis-video/${video.id}`}>
                        <EyeIcon />
                      </Link>
                    </Button>
                    {video.status === "REJECTED" ? (
                      <Button asChild variant="destructive" size="icon-sm" aria-label="Perbaiki">
                        <Link href={`/pharmacist/dashboard/tulis-video/${video.id}/edit`}>
                          <PencilIcon />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <EmptyRow colSpan={5} label="Belum ada video." />
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default async function PharmacistContentPage() {
  const user = await requireRole("PHARMACIST")
  const [drugSubmissions, articles, videos] = await Promise.all([
    db.$queryRaw<DrugSubmission[]>`
      SELECT
        id,
        "genericName",
        status::text AS status,
        "adminNote",
        "revisesDrugId",
        "updatedAt"
      FROM "DrugInformation"
      WHERE "reviewerId" = ${user.id}
        AND status::text <> 'ARCHIVED'
      ORDER BY "updatedAt" DESC
      LIMIT ${24}
    `,
    getArticles({ authorId: user.id, limit: 24 }),
    getVideos({ authorId: user.id, limit: 24 }),
  ])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 md:py-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Buat Konten
          </h1>
          <p className="text-sm text-muted-foreground">
            Pilih format konten yang ingin dikelola.
          </p>
        </div>
      </header>

      <Tabs defaultValue="obat" className="gap-4">
        <TabsList className="flex h-14 w-full justify-start gap-1 overflow-x-auto overflow-y-hidden rounded-2xl bg-card p-1.5">
          {contentTypes.map((item) => {
            const Icon = item.icon

            return (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="h-11 min-w-32 shrink-0 rounded-xl px-4 data-active:bg-primary data-active:text-primary-foreground"
              >
                <Icon data-icon="inline-start" />
                <span className="truncate">{item.tabLabel}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {contentTypes.map((item) => {
          const Icon = item.icon

          return (
            <TabsContent key={item.value} value={item.value}>
              <Card className="overflow-hidden rounded-[1.75rem] border-0 bg-card shadow-none ring-0">
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <ContentActions href={item.newHref} label={item.action} />
                  {item.value === "obat" ? (
                    <DrugList submissions={drugSubmissions} />
                  ) : item.value === "artikel" ? (
                    <ArticleList articles={articles.articles} />
                  ) : (
                    <VideoList videos={videos.videos} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </main>
  )
}
