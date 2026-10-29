"use client";

import { Fragment, useState, useEffect } from "react";

import { CLUB, NewGamePopup } from "@/components/new-game-popup";
import { NewSeasonPopup } from "@/components/new-season-popup";
import {
  GameAdminActions,
  SeasonAdminActions,
} from "@/components/season-admin-actions";
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
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useSeasons } from "@/hooks/use-seasons";

export default function SeasonScreen() {
  const { data: seasonsResponse, isPending: isSeasonsPending } = useSeasons();
  const seasonsData = seasonsResponse?.data?.season;
  const seasonsList = seasonsData ?? [];
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");
  const isAdmin = useIsAdmin();

  // also falls back to the newest season when the selected one was deleted
  useEffect(() => {
    if (!seasonsData) return;
    if (!seasonsData.some((s) => s.id === selectedSeasonId)) {
      setSelectedSeasonId(seasonsData[0]?.id ?? "");
    }
  }, [seasonsData, selectedSeasonId]);

  const currentSeason = seasonsList.find((s) => s.id === selectedSeasonId);
  const selectedSeasonTitle = currentSeason?.title || "";
  const games = currentSeason?.game ?? [];

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:gap-1">
          <span className="text-lg">
            {isSeasonsPending ? (
              <Skeleton className="h-7 w-46" />
            ) : (
              currentSeason?.league
            )}
          </span>
          <div className="flex sm:flex-row flex-col sm:gap-2 gap-0 items-baseline">
            <h1 className="text-3xl font-bold tracking-tight">
              {isSeasonsPending ? (
                <Skeleton className="h-9 w-58" />
              ) : (
                currentSeason?.title
              )}
            </h1>
            <span className="text-muted-foreground sm:text-sm text-xs">
              {isSeasonsPending ? (
                <Skeleton className="sm:h-5 sm:w-42 h-4 w-34" />
              ) : currentSeason ? (
                `${new Date(currentSeason.from).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })} - ${new Date(currentSeason.to).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}`
              ) : (
                ""
              )}
            </span>
          </div>
        </div>
        <div className="flex sm:flex-row flex-col items-end justify-between gap-4">
          <p className="text-base flex-1 min-w-0">
            Hier finden Sie Informationen zur aktuellen Saison wie auch zu
            vergangenen Saisons, einschließlich Spielpläne und Ergebnissen.
          </p>
          <div className="shrink-0 sm:w-auto w-full flex sm:flex-row flex-col gap-2">
            <NewGamePopup season={currentSeason} />
            <NewSeasonPopup />
          </div>
        </div>
        <Separator className="sm:my-8 my-6" />
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex items-center gap-2">
            <Combobox
              items={seasonsList}
              disabled={isSeasonsPending}
              value={selectedSeasonId}
              onValueChange={(val) => setSelectedSeasonId(val ?? "")}
            >
              <ComboboxInput
                className="flex-1"
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
            {isAdmin && currentSeason && (
              <SeasonAdminActions season={currentSeason} />
            )}
          </div>

          {isSeasonsPending ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="w-full">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden md:table-cell md:w-24 lg:w-30">
                      Spielzeit
                    </TableHead>
                    <TableHead className="text-right">Heimteam</TableHead>
                    <TableHead className="w-20 sm:w-24 text-center">
                      Ergebnis
                    </TableHead>
                    <TableHead className="text-left">Gastteam</TableHead>
                    {isAdmin && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.map((game) => {
                    const dateObj = new Date(game.date);
                    const dateStr = dateObj.toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                    const timeOnly =
                      dateObj.toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) + " Uhr";

                    const isCoburgHome = game.host === CLUB;
                    const isCoburgAway = game.guest === CLUB;

                    const hasPlayed =
                      game.hostPoints !== null && game.guestPoints !== null;

                    return (
                      <Fragment key={game.id}>
                        <TableRow className="border-none hover:bg-transparent md:hidden">
                          <TableCell
                            colSpan={isAdmin ? 4 : 3}
                            className="pt-3 pb-0 text-center text-xs text-muted-foreground"
                          >
                            {dateStr} · {timeOnly}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="hidden md:table-cell py-3">
                            <div className="text-sm font-medium">{dateStr}</div>
                            <div className="text-xs text-muted-foreground">
                              {timeOnly}
                            </div>
                          </TableCell>
                          <TableCell
                            className={`truncate text-right py-3 text-xs sm:text-sm ${
                              isCoburgHome
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground"
                            }`}
                          >
                            {game.host}
                          </TableCell>
                          <TableCell className="text-center font-bold tracking-wider py-3 px-1 sm:px-2 text-sm sm:text-base">
                            {hasPlayed
                              ? `${game.hostPoints} : ${game.guestPoints}`
                              : "- : -"}
                          </TableCell>
                          <TableCell
                            className={`truncate text-left py-3 text-xs sm:text-sm ${
                              isCoburgAway
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground"
                            }`}
                          >
                            {game.guest}
                          </TableCell>
                          {isAdmin && currentSeason && (
                            <TableCell className="py-3 px-0 text-right">
                              <GameAdminActions
                                season={currentSeason}
                                game={game}
                              />
                            </TableCell>
                          )}
                        </TableRow>
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
