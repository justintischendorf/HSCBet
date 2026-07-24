"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGroupById } from "@/hooks/use-groupById";
import { useSeasons } from "@/hooks/use-seasons";
import { useTips } from "@/hooks/use-tips";
import type { Position } from "@repo/database";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const POSITION_ASSET_SLUGS: Record<Position, string> = {
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum",
  DIAMOND: "diamond",
  DEFAULT: "none",
};

export default function GroupStats() {
  const params = useParams();
  const groupId = String(params.id);

  const { data: seasonsResponse, isPending: isSeasonsPending } = useSeasons();

  const seasonsList = useMemo(() => {
    return seasonsResponse?.data?.season ?? [];
  }, [seasonsResponse?.data?.season]);

  const { data: groupResponse, isPending: isGroupPending } =
    useGroupById(groupId);

  const userList = useMemo(() => {
    return groupResponse?.data?.group?.user ?? [];
  }, [groupResponse?.data?.group?.user]);

  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");

  const currentSeason = seasonsList.find((s) => s.id === selectedSeasonId);

  const { data: tipResponse, isPending: isTipPending } = useTips(
    String(currentSeason?.id),
  );

  const tipList = useMemo(() => {
    return tipResponse?.data?.season ?? [];
  }, [tipResponse?.data?.season]);

  const selectedSeasonTitle = currentSeason?.title ?? "";

  const gamesList = currentSeason?.game ?? [];

  useEffect(() => {
    if (seasonsList.length > 0 && !selectedSeasonId) {
      setSelectedSeasonId(seasonsList[0].id);
    }
  }, [seasonsList, selectedSeasonId]);

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Gruppenübersicht</h1>
        <div className="flex sm:flex-row flex-col items-end justify-between gap-4">
          <p className="text-base flex-1 min-w-0">
            Hier findest du eine Übersicht über alle Tipps deiner Gruppe in der
            ausgewählten Saison.
          </p>
        </div>
        <Separator className="sm:my-8 my-6" />
        <div className="flex flex-col gap-6 md:gap-8">
          <Combobox
            items={seasonsList}
            disabled={isSeasonsPending}
            value={selectedSeasonId}
            onValueChange={(val) => setSelectedSeasonId(val ?? "")}
          >
            <ComboboxInput
              placeholder="Wähle eine Saison"
              value={isSeasonsPending ? "Laden..." : selectedSeasonTitle}
            />
            <ComboboxContent>
              <ComboboxEmpty>Keine Saison gefunden.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item.id} value={item.id}>
                    {item.title}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-25 sticky left-0 bg-background">
                  Name
                </TableHead>
                <TableHead>Rang</TableHead>
                <TableHead>Punkte</TableHead>
                {gamesList.map((game) => (
                  <TableHead key={game.id} className="font-medium text-center">
                    {`${game.host} `}{" "}
                    <span className="font-bold text-lg">
                      {" "}
                      {`${game.hostPoints} : ${game.guestPoints}`}{" "}
                    </span>{" "}
                    {`${game.guest}`}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {userList.map((user) => {
                const position = user.rank?.position;
                const positionSlug = position
                  ? POSITION_ASSET_SLUGS[position]
                  : "none";

                return (
                  <TableRow key={user.id}>
                    <TableCell className="sticky left-0 z-10 bg-background">
                      {user.name}
                    </TableCell>
                    <TableCell>
                      {isGroupPending ? (
                        <Skeleton className="h-10 w- rounded-full" />
                      ) : (
                        <Image
                          loading="eager"
                          src={`/assets/images/rank-${positionSlug}.svg`}
                          alt={position || "Rang"}
                          width={40}
                          height={40}
                          className="w-10 h-10 shrink-0 object-contain"
                        />
                      )}
                    </TableCell>
                    <TableCell>{user.rank?.points ?? 0}</TableCell>
                    {gamesList.map((game) => {
                      const userTip = tipList.find(
                        (tip) =>
                          tip.gameId === game.id && tip.userId === user.id,
                      );
                      return (
                        <TableCell
                          key={game.id}
                          className="relative h-14 min-w-20 text-center p-2"
                        >
                          {userTip ? (
                            <>
                              <span className="font-medium block">
                                {`${userTip.tipHost} : ${userTip.tipGuest}`}
                              </span>
                              <span className="text-[10px] text-muted-foreground leading-none text-center">
                                ({userTip.result ?? 0} Pkt.)
                              </span>
                            </>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
