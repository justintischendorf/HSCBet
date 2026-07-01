'use client';

import { AvatarBadge, Avatar, AvatarImage } from './ui/avatar';
import { HoverCardTrigger, HoverCardContent, HoverCard } from './ui/hover-card';
import { useSession } from '@/lib/auth-client';

export default function NavbarAvatar(connected: { connected: boolean }) {
  const session = useSession();
  const user = session?.data?.user;

  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Avatar>
          <AvatarImage
            id="profile-picture"
            src={
              user?.image ||
              `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user?.name}`
            }
            alt="Profilbild"
          />
          <AvatarBadge
            className={connected ? 'bg-positive' : 'bg-destructive'}
          />
        </Avatar>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-full items-center justify-center p-2">
        {connected ? (
          <p className="text-xs text-positive">Online</p>
        ) : (
          <p className="text-xs text-destructive">Offline</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
