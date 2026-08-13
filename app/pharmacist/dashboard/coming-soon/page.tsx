import { ComingSoonContent } from "@/components/landing/coming-soon-content"

export const metadata = {
  title: "Segera Hadir | Medisigna",
}

export default function PharmacistDashboardComingSoonPage() {
  return (
    <main className="min-h-[calc(100dvh-7rem)] rounded-[2rem] bg-secondary py-4 md:rounded-[2.25rem] md:py-6">
      <ComingSoonContent
        primaryHref="/pharmacist/dashboard"
        primaryLabel="Kembali ke Dashboard"
      />
    </main>
  )
}
