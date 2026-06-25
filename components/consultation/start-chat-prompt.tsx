"use client"

import Link from "next/link"
import * as React from "react"
import { useFormStatus } from "react-dom"
import { ClockIcon, MapPinIcon, ShieldCheckIcon } from "lucide-react"

import { startConsultationSession } from "@/app/actions/consultation/start-session"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"

type StartChatPromptProps = {
  pharmacistId: string
  name: string
  title: string
  image?: string
  bio: string
  topics: string[]
  practiceLocation: string
  serviceHours: string
  loginHref?: string
  defaultOpen?: boolean
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function StartButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" className="w-full rounded-full" disabled={pending}>
      {pending ? "Memulai..." : "Mulai Chat"}
    </Button>
  )
}

function PromptContent({
  pharmacistId,
  name,
  title,
  image,
  bio,
  topics,
  practiceLocation,
  serviceHours,
  loginHref,
}: StartChatPromptProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-56 flex-1 bg-muted">
        <Avatar className="size-full rounded-none">
          <AvatarImage className="rounded-none object-cover object-top" src={image} alt={name} />
          <AvatarFallback className="rounded-none text-5xl font-semibold">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="relative -mt-10 flex max-h-[60svh] flex-col gap-5 overflow-y-auto rounded-t-[2.5rem] bg-background px-7 pt-9 pb-8">
        <div className="text-center">
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheckIcon className="size-3.5" />
              Apoteker terverifikasi
            </span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{title}</p>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl bg-muted/60 p-4 text-sm">
          <div className="flex items-start gap-3">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{practiceLocation}</span>
          </div>
          <div className="flex items-start gap-3">
            <ClockIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{serviceHours}</span>
          </div>
        </div>

        {/* {topics.length ? (
          <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Topik bantuan</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
          </div>
        ) : null} */}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Tentang apoteker</p>
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{bio}</p>
        </div>

        {loginHref ? (
          <Button asChild size="lg" className="w-full rounded-full">
            <Link href={loginHref}>Masuk untuk Mulai Chat</Link>
          </Button>
        ) : (
          <form action={startConsultationSession.bind(null, pharmacistId)} className="w-full">
            <StartButton />
          </form>
        )}
      </div>
    </div>
  )
}

export function StartChatPrompt(props: StartChatPromptProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(props.defaultOpen ?? false)

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button className="w-full">Mulai Chat</Button>
        </DrawerTrigger>
        <DrawerContent
          className="
    !h-[90svh]
    !max-h-[90svh]
    !rounded-t-2xl
    !border-0
    !p-0
  "
        >
          <DrawerHeader className="sr-only">
            <DrawerTitle>Mulai chat dengan {props.name}</DrawerTitle>
            <DrawerDescription>Konfirmasi untuk memulai konsultasi.</DrawerDescription>
          </DrawerHeader>
          <PromptContent {...props} />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Mulai Chat</Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton
        className="h-[min(42rem,calc(100svh-2rem))] max-w-sm overflow-hidden rounded-[2rem] p-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Mulai chat dengan {props.name}</DialogTitle>
          <DialogDescription>Konfirmasi untuk memulai konsultasi.</DialogDescription>
        </DialogHeader>
        <PromptContent {...props} />
      </DialogContent>
    </Dialog>
  )
}
