import { BellRing, Info, Pill, ShoppingCart } from "lucide-react"

const services = [
  {
    title: "Konsultasi Obat",
    icon: Pill,
    accent: "text-primary",
  },
  {
    title: "Informasi Obat",
    icon: Info,
    accent: "text-chart-2",
  },
  {
    title: "Pengingat Obat",
    icon: BellRing,
    accent: "text-chart-4",
  },
  {
    title: "Beli Obat",
    icon: ShoppingCart,
    accent: "text-muted-foreground",
    status: "Coming soon",
  },
]

export function ServicesSection() {
  return (
    <section className="relative overflow-hidden bg-primary py-14 text-primary-foreground pb-20 ">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(255,255,255,0.12),transparent_30%),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_100%,100%_100%,28px_28px,28px_28px]"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6">
        <div className="flex max-w-2xl flex-col gap-3 justify-center text-center md:mx-auto md:gap-4">
          <p className="text-sm font-medium text-primary-foreground/75">
            Layanan utama
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            Medisigna
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {services.map((service) => {
            const Icon = service.icon

            return (
              <div
                key={service.title}
                className="relative flex min-w-0 flex-col items-center overflow-hidden rounded-lg bg-primary-foreground/10 p-2 text-center transition-colors duration-200 hover:bg-primary-foreground/20 md:rounded-2xl md:py-5"
              >
                {service.status ? (
                  <span className="pointer-events-none absolute left-1/2 top-1/2 w-[160%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-yellow-400 py-0.5 text-[8px] font-bold uppercase tracking-wide text-yellow-950 shadow-sm md:py-1 md:text-[11px]">
                    {service.status}
                  </span>
                ) : null}
                <div className="flex size-11 items-center justify-center rounded-full bg-primary-foreground/10 md:size-20">
                  <div className="flex size-8 items-center justify-center rounded-full bg-background md:size-14">
                    <Icon className={`size-4 md:size-7 ${service.accent}`} />
                  </div>
                </div>
                <h3 className="mt-2 text-[10px] font-semibold leading-3 md:mt-3 md:text-sm md:leading-5">
                  {service.title}
                </h3>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
