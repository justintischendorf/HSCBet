import { Crown, MoveRight, Star, Users } from "lucide-react";
import Link from "next/link";

import { useGroups } from "@/hooks/use-groups";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export function FavoriteGroupCard() {
  const { data: session } = useSession();
  const { data: groupsResponse, isPending } = useGroups();

  const groups = groupsResponse?.data?.group ?? [];
  const favoriteGroupId = groupsResponse?.data?.favoriteGroupId;
  const group = groups.find((g) => g.id === favoriteGroupId);

  if (isPending) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }

  if (!group) {
    return (
      <div className="border border-border rounded-xl bg-card shadow-sm">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle className="text-base">
              Keine Gruppe vorhanden
            </EmptyTitle>
            <EmptyDescription className="text-sm">
              Du bist noch in keiner Gruppe Mitglied. Erstelle eine Gruppe oder
              lass dich einladen, um hier die Punkte deiner Gruppe zu sehen.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/groups">
                Zu den Gruppen
                <MoveRight />
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const imageUrl = group.files?.[0]
    ? `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/media/${group.files[0].id}/image`
    : undefined;

  const rankedMembers = [...group.members].sort(
    (a, b) => (b.rank?.points ?? 0) - (a.rank?.points ?? 0),
  );

  return (
    <div className="flex flex-col gap-4 border border-border rounded-xl bg-card p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <Avatar className="size-12 shrink-0">
            <AvatarImage src={imageUrl} alt={group.name} />
            <AvatarFallback className="text-lg">
              {group.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="size-3.5 fill-huk-accent text-foreground dark:text-huk-accent" />
              Favorisierte Gruppe
            </span>
            <h2 className="text-lg font-semibold truncate">{group.name}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <Link href="/groups">Favorit ändern</Link>
          </Button>
          <Button asChild className="flex-1 sm:flex-none">
            <Link href={`/groups/${group.id}`}>
              Statistiken
              <MoveRight />
            </Link>
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 text-center">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-center">Tipps</TableHead>
            <TableHead className="text-center">Richtig</TableHead>
            <TableHead className="text-right">Punkte</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rankedMembers.map((member, index) => {
            const isCurrentUser = member.id === session?.user?.id;

            return (
              <TableRow
                key={member.id}
                className={cn(isCurrentUser && "bg-muted/60 font-semibold")}
              >
                <TableCell className="text-center tabular-nums text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar size="sm" className="shrink-0">
                      <AvatarImage
                        src={member.image ?? undefined}
                        alt={member.name}
                      />
                      <AvatarFallback className="text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {member.name}
                      {isCurrentUser && " (Du)"}
                    </span>
                    {member.id === group.leader.id && (
                      <span className="flex shrink-0 items-center rounded-full bg-huk-accent px-1.5 py-0.5 text-foreground dark:text-background">
                        <Crown className="size-2.5" />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {member.tipCount}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {member.correctTipCount}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {member.rank?.points ?? 0}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
