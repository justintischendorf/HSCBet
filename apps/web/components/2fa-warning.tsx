'use client';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { CircleAlert } from 'lucide-react';
import Link from 'next/link';

export function TwoFactorWarning() {
  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild>
        <CircleAlert className="text-warning size-4" />
      </HoverCardTrigger>
      <HoverCardContent className="flex w-64 flex-col gap-0.5">
        <div className="font-semibold">2FA ist nicht aktiv</div>
        <div className="text-sm text-muted-foreground">
          Aktiviere die 2-Faktor-Authentifizierung für zusätzliche Sicherheit.{' '}
          {''}
          <Link href="/2fa" className="underline text-foreground">
            Aktivieren
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
