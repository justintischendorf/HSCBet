'use client';

import Link from 'next/link';
import { AvatarBadge, Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { HoverCardTrigger, HoverCardContent, HoverCard } from './ui/hover-card';
import { useSession } from '@/lib/auth-client';
import { Skeleton } from './ui/skeleton';

export default function NavbarAvatar({ connected }: { connected: boolean }) {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const fallbackChar = user?.name?.charAt(0).toUpperCase() ?? '?';

  if (isPending) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link href="/account-settings">
          <Avatar>
            <AvatarImage
              id="profile-picture"
              src={user?.image || undefined}
              alt="Profilbild"
            />
            <AvatarFallback>{fallbackChar}</AvatarFallback>
            <AvatarBadge
              className={connected ? 'bg-positive' : 'bg-destructive'}
            />
          </Avatar>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-full items-center justify-center px-2 py-1">
        {connected ? (
          <p className="text-xs text-positive">Online</p>
        ) : (
          <p className="text-xs text-destructive">Offline</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
