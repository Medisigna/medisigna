import Link from "next/link"
import {
  ArrowRightIcon,
  NewspaperIcon,
  PillIcon,
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

const contentTypes = [
  {
    title: "Informasi Obat",
    description: "Monografi obat untuk Kamus Obat.",
    href: "/pharmacist/dashboard/tulis-obat",
    action: "Tulis Obat",
    icon: PillIcon,
  },
  {
    title: "Artikel Edukasi",
    description: "Artikel kesehatan untuk pasien.",
    href: "/pharmacist/dashboard/tulis-artikel",
    action: "Tulis Artikel",
    icon: NewspaperIcon,
  },
  {
    title: "Video Edukasi",
    description: "Konten video dari link YouTube.",
    href: "/pharmacist/dashboard/tulis-video",
    action: "Tulis Video",
    icon: VideoIcon,
  },
] as const

export default function PharmacistContentPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 md:py-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Konten</h1>
          <p className="text-sm text-muted-foreground">
            Pilih format konten yang ingin dikelola.
          </p>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        {contentTypes.map((item) => {
          const Icon = item.icon

          return (
            <Card
              key={item.href}
              className="overflow-hidden rounded-[1.75rem] border-0 bg-card shadow-none ring-0"
            >
              <CardHeader className="flex flex-col items-center gap-3 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={item.href}>
                    {item.action}
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </main>
  )
}
