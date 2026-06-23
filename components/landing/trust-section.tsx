import { ClipboardCheck, LockKeyhole, UserCheck } from "lucide-react"

const trustItems = [
  { title: "Apoteker terverifikasi", icon: UserCheck },
  { title: "Riwayat konsultasi tercatat", icon: ClipboardCheck },
  { title: "Data pasien dijaga", icon: LockKeyhole },
]

export function TrustSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-3 rounded-xl border bg-muted p-4 md:grid-cols-3">
        {trustItems.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.title} className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md bg-background text-foreground">
                <Icon className="size-4" />
              </div>
              <p className="text-sm font-medium">{item.title}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
