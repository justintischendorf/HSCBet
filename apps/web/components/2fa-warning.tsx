"use client";

import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export function TwoFactorWarning() {
  const [open, setOpen] = useState(false);

  return (
    <HoverCard
      open={open}
      onOpenChange={setOpen}
      openDelay={10}
      closeDelay={100}
    >
      <HoverCardTrigger asChild>
        <CircleAlert
          className="text-warning size-4 cursor-pointer"
          onClick={() => setOpen((o) => !o)}
        />
      </HoverCardTrigger>
      <HoverCardContent className="flex sm:w-64 w-44 flex-col gap-0.5">
        <div className="font-semibold">2FA ist nicht aktiv</div>
        <div className="text-sm text-muted-foreground">
          Aktiviere die 2-Faktor-Authentifizierung für zusätzliche Sicherheit.{" "}
          <Link href="/2fa" className="underline text-foreground">
            Aktivieren
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
