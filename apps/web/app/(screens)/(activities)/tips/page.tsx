"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Tip from "@/components/tip";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeasons } from "@/hooks/use-seasons";
import { useTips, tipsQueryKey } from "@/hooks/use-tips";
import { useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import type { GameModel } from "@repo/database";

interface TipDraft {
  host: string;
  guest: string;
}

const AUTO_SAVE_DELAY_MS = 700;

export default function TipsScreen() {
  const { data: session } = useSession();
  const userId = session?.user.id;

  const { data: seasonsResponse, isPending: isSeasonsPending } = useSeasons();

  const seasonsList = useMemo(() => {
    return seasonsResponse?.data?.season ?? [];
  }, [seasonsResponse?.data?.season]);

  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("");

  useEffect(() => {
    if (seasonsList.length > 0 && !selectedSeasonId) {
      setSelectedSeasonId(seasonsList[0].id);
    }
  }, [seasonsList, selectedSeasonId]);

  const { data: tipsResponse, isPending: isTipsPending } =
    useTips(selectedSeasonId);

  useEffect(() => {
    if (tipsResponse?.error) {
      toast.error(`${tipsResponse.error.status}: ${tipsResponse.error.value}`);
    }
  }, [tipsResponse?.error]);

  const myTips = useMemo(() => {
    const tipsData = tipsResponse?.data?.season ?? [];
    const map = new Map<string, (typeof tipsData)[number]>();
    tipsData
      .filter((tip) => tip.userId === userId)
      .forEach((tip) => map.set(tip.gameId, tip));
    return map;
  }, [tipsResponse, userId]);

  const currentSeason = seasonsList.find((s) => s.id === selectedSeasonId);
  const selectedSeasonTitle = currentSeason?.title ?? "";
  const gamesList = currentSeason?.game ?? [];

  const [drafts, setDrafts] = useState<Record<string, TipDraft>>({});
  const autoSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  useEffect(() => {
    const timers = autoSaveTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const getDraft = (gameId: string): TipDraft => {
    const draft = drafts[gameId];
    if (draft) return draft;

    const existingTip = myTips.get(gameId);
    return {
      host: existingTip ? String(existingTip.tipHost) : "",
      guest: existingTip ? String(existingTip.tipGuest) : "",
    };
  };

  const saveTip = async (gameId: string, draft: TipDraft) => {
    if (!userId || !selectedSeasonId) return;

    const { error } = await apiClient.api.tip.put({
      seasonId: selectedSeasonId,
      gameId,
      userId,
      tipHost: Number(draft.host),
      tipGuest: Number(draft.guest),
    });

    if (error) {
      const message =
        error.value &&
        typeof error.value === "object" &&
        "message" in error.value
          ? String(error.value.message)
          : `${error.status}: ${error.value}`;
      toast.error(message);
      return;
    }

    queryClient.invalidateQueries({ queryKey: tipsQueryKey(selectedSeasonId) });
  };

  const handleFieldChange = (
    game: GameModel,
    field: keyof TipDraft,
    value: string,
  ) => {
    const nextDraft = { ...getDraft(game.id), [field]: value };
    setDrafts((prev) => ({ ...prev, [game.id]: nextDraft }));

    const timers = autoSaveTimers.current;
    if (timers[game.id]) {
      clearTimeout(timers[game.id]);
    }

    if (nextDraft.host === "" || nextDraft.guest === "") return;

    timers[game.id] = setTimeout(() => {
      void saveTip(game.id, nextDraft);
    }, AUTO_SAVE_DELAY_MS);
  };

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Meine Tipps</h1>
        <p className="text-base mt-2">
          Hier findest du alle Spiele der Saison. Tippe direkt auf ein Spiel –
          dein Tipp wird automatisch gespeichert und ist bis zum Spielbeginn
          änderbar. Danach wird er gesperrt.
        </p>
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

          {isSeasonsPending || isTipsPending ? (
            <Skeleton className="h-96 w-full" />
          ) : gamesList.length > 0 ? (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell md:w-24 lg:w-30">
                    Spielzeit
                  </TableHead>
                  <TableHead className="text-right">Heimteam</TableHead>
                  <TableHead className="w-20 sm:w-24 text-center">
                    Tipp
                  </TableHead>
                  <TableHead className="text-left">Gastteam</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gamesList.map((game) => {
                  const myTip = myTips.get(game.id) ?? null;
                  const hasStarted =
                    new Date(game.date).getTime() <= Date.now();

                  if (hasStarted) {
                    return (
                      <Tip key={game.id} tipData={myTip} gameData={game} />
                    );
                  }

                  const draft = getDraft(game.id);
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

                  return (
                    <Fragment key={game.id}>
                      <TableRow className="border-none hover:bg-transparent md:hidden">
                        <TableCell
                          colSpan={3}
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
                        <TableCell className="truncate text-right py-3 text-xs sm:text-sm font-semibold">
                          {game.host}
                        </TableCell>
                        <TableCell className="py-3 px-1 sm:px-2">
                          <div className="flex items-center justify-center gap-1">
                            <Input
                              type="number"
                              min={0}
                              max={99}
                              placeholder="0"
                              className="w-8 px-1 text-center shrink-0"
                              disabled={!userId}
                              value={draft.host}
                              onChange={(e) =>
                                handleFieldChange(game, "host", e.target.value)
                              }
                            />
                            <span className="text-sm text-muted-foreground shrink-0">
                              :
                            </span>
                            <Input
                              type="number"
                              min={0}
                              max={99}
                              placeholder="0"
                              className="w-8 px-1 text-center shrink-0"
                              disabled={!userId}
                              value={draft.guest}
                              onChange={(e) =>
                                handleFieldChange(game, "guest", e.target.value)
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell className="truncate text-left py-3 text-xs sm:text-sm font-semibold">
                          {game.guest}
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="mt-20 text-center text-sm text-muted-foreground">
              Für diese Saison sind noch keine Spiele vorhanden.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
