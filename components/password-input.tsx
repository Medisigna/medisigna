"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

export function PasswordInput(props: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <InputGroup>
      <InputGroupInput {...props} type={visible ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={visible ? "Sembunyikan password" : "Lihat password"}
          size="icon-sm"
          onClick={() => setVisible((value) => !value)}
        >
          <Icon data-icon="inline-start" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
