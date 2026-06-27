import { DashboardPromoCarousel } from "@/components/dashboard-promo-carousel"
import { requireRole } from "@/lib/session"

export default async function PharmacistDashboardPage() {
  await requireRole("PHARMACIST")

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <DashboardPromoCarousel />
    </main>
  )
}
