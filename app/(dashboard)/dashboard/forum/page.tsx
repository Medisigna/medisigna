import { MessagesSquareIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function PatientForumPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <Card>
        <CardHeader className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-lg bg-muted text-primary">
            <MessagesSquareIcon className="size-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <CardTitle>Forum Diskusi</CardTitle>
            <CardDescription>Fitur diskusi pasien sedang disiapkan.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">Segera hadir.</p>
        </CardContent>
      </Card>
    </main>
  )
}
