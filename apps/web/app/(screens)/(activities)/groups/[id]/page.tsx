"use client";

import { Separator } from "@/components/ui/separator";
import { useMemo, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSeasons } from "@/hooks/use-seasons";
import { useTips } from "@/hooks/use-tips";
import { useParams } from "next/navigation";
import { useGroupById } from "@/hooks/use-groupById";

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
        <div className="flex flex-col gap-6 md:gap-8 ">
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
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-25">Name</TableHead>
              <TableHead>Rang</TableHead>
              <TableHead>Punkte</TableHead>
              {gamesList.map((game) => (
                <TableHead key={game.id} className="font-medium text-center">
                  {`${game.host} vs ${game.guest}`} <br />
                  {`${game.hostPoints} : ${game.guestPoints}`}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.rank?.position}</TableCell>
                <TableCell>{user.rank?.points}</TableCell>
                {gamesList.map((game) => {
                  const userTip = tipList.find(
                    (tip) => tip.gameId === game.id && tip.userId === user.id,
                  );
                  return (
                    <TableCell key={game.id} className="text-center">
                      {userTip ? (
                        <>
                          <span>{`${userTip.tipHost} : ${userTip.tipGuest}`}</span>
                          <br />
                          <div className="text-xs text-muted-foreground">
                            ({userTip.result ?? 0} Pkt.)
                          </div>
                        </>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
