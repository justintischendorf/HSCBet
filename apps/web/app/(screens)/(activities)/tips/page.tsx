"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeasons } from "@/hooks/use-seasons";
import { useTips, tipsQueryKey } from "@/hooks/use-tips";
import { useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";
import { toast } from "sonner";
import { PenLine } from "lucide-react";

interface TipDraft {
  host: string;
  guest: string;
}

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
  const [submittingGameId, setSubmittingGameId] = useState<string | null>(null);

  const updateDraft = (
    gameId: string,
    field: keyof TipDraft,
    value: string,
  ) => {
    setDrafts((prev) => {
      const existing = prev[gameId] ?? { host: "", guest: "" };
      return { ...prev, [gameId]: { ...existing, [field]: value } };
    });
  };

  const submitTip = async (gameId: string) => {
    const draft = drafts[gameId];
    if (!userId || !selectedSeasonId || myTips.has(gameId)) return;
    if (!draft?.host || !draft?.guest) return;

    setSubmittingGameId(gameId);
    const { error } = await apiClient.api.tip.post({
      seasonId: selectedSeasonId,
      gameId,
      userId,
      tipHost: Number(draft.host),
      tipGuest: Number(draft.guest),
    });
    setSubmittingGameId(null);

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

    toast.success("Tipp erfolgreich abgegeben");
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[gameId];
      return next;
    });
    queryClient.invalidateQueries({ queryKey: tipsQueryKey(selectedSeasonId) });
  };

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Meine Tipps</h1>
        <p className="text-base mt-2">
          Hier findest du alle Spiele der Saison. Gib direkt einen Tipp ab – pro
          Spiel kannst du nur einmal tippen.
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
            <div className="flex flex-col gap-3">
              {gamesList.map((game) => {
                const myTip = myTips.get(game.id);
                if (myTip) {
                  return <Tip key={game.id} tipData={myTip} gameData={game} />;
                }

                const draft = drafts[game.id];
                const isSubmitting = submittingGameId === game.id;

                return (
                  <div
                    key={game.id}
                    className="flex flex-col gap-3 border border-border rounded-xl bg-card p-4 shadow-sm"
                  >
                    <div className="flex sm:flex-row flex-col sm:items-center justify-between">
                      <div className="flex flex-row items-baseline sm:gap-3 gap-2 text-lg font-bold">
                        <span className="text-sm sm:text-base font-bold">
                          {game.host}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-muted-foreground">
                          vs
                        </span>
                        <span className="text-sm sm:text-base font-bold">
                          {game.guest}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(game.date).toLocaleString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        Uhr
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={99}
                        placeholder="0"
                        className="w-16 text-center"
                        disabled={!userId || isSubmitting}
                        value={draft?.host ?? ""}
                        onChange={(e) =>
                          updateDraft(game.id, "host", e.target.value)
                        }
                      />
                      <span className="text-sm text-muted-foreground">:</span>
                      <Input
                        type="number"
                        min={0}
                        max={99}
                        placeholder="0"
                        className="w-16 text-center"
                        disabled={!userId || isSubmitting}
                        value={draft?.guest ?? ""}
                        onChange={(e) =>
                          updateDraft(game.id, "guest", e.target.value)
                        }
                      />
                      <Button
                        size="sm"
                        className="ml-auto"
                        disabled={
                          !userId ||
                          isSubmitting ||
                          !draft?.host ||
                          !draft?.guest
                        }
                        onClick={() => submitTip(game.id)}
                      >
                        {isSubmitting ? "Tippt..." : "Tippen"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
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
