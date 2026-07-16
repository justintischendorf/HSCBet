"use client";

import { useEffect } from "react";
import { TipChart } from "@/components/tip-chart";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
import { groupsQueryKey, groupsQueryFn } from "@/hooks/use-groups";
import { seasonsQueryKey, seasonsQueryFn } from "@/hooks/use-seasons";
import { tipsQueryKey, tipsQueryFn } from "@/hooks/use-tips";
import Image from "next/image";
import { useRank } from "@/hooks/use-rank";
import type { Position } from "@repo/database";

const RANKS = [
  { key: "bronze", label: "Bronze", threshold: 200 },
  { key: "silver", label: "Silber", threshold: 400 },
  { key: "gold", label: "Gold", threshold: 600 },
  { key: "platinum", label: "Platin", threshold: 800 },
  { key: "diamond", label: "Diamant", threshold: 1000 },
] as const;

const POSITION_ASSET_SLUGS: Record<Position, string> = {
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum",
  DIAMOND: "diamond",
  DEFAULT: "none",
};

export default function DashboardScreen() {
  const session = useSession();
  const user = session?.data?.user;

  const { isPending: isRankPending, data: rankData } = useRank();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: groupsQueryKey,
      queryFn: groupsQueryFn,
    });

    queryClient
      .fetchQuery({
        queryKey: seasonsQueryKey,
        queryFn: seasonsQueryFn,
      })
      .then((seasonsResponse) => {
        const firstSeasonId = seasonsResponse?.data?.season?.[0]?.id;
        if (!firstSeasonId) return;

        queryClient.prefetchQuery({
          queryKey: tipsQueryKey(firstSeasonId),
          queryFn: tipsQueryFn(firstSeasonId),
        });
      });
  }, []);

  const points = rankData?.data?.rank?.points;
  const position = rankData?.data?.rank?.position;
  const hasRank = !!position && position !== "DEFAULT";
  const positionSlug = position ? POSITION_ASSET_SLUGS[position] : "none";

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">
          {!user ? <Skeleton className="h-9 w-48" /> : `Hallo ${user.name}!`}
        </h1>
        <div className="flex sm:flex-row flex-col items-end justify-between gap-4">
          <p className="text-base">
            Willkommen auf deinem Dashboard! Hier findest du eine Übersicht über
            deine Aktivitäten und deinen aktuellen Rang.
          </p>
        </div>
        <Separator className="sm:my-8 my-6" />
        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col gap-6 border border-border rounded-xl bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {isRankPending ? (
                <Skeleton className="h-23.25 w-22" />
              ) : (
                <Image
                  loading="eager"
                  src={`/assets/images/rank-${positionSlug}.svg`}
                  alt={position || "Rang"}
                  width={88}
                  height={93}
                  className="w-22 h-23.25 shrink-0"
                />
              )}
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Aktueller Rang
                </span>
                <h2 className="text-xl font-semibold">
                  {isRankPending ? (
                    <Skeleton className="h-6 w-32" />
                  ) : hasRank ? (
                    RANKS.find((rank) => rank.key === positionSlug)?.label
                  ) : (
                    "Kein Rang"
                  )}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {isRankPending ? (
                    <Skeleton className=" mt-1 h-4 w-16" />
                  ) : (
                    `${points} Punkte`
                  )}
                </span>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-5 gap-1.5 sm:gap-6">
              {RANKS.map((rank) => {
                return (
                  <div
                    key={rank.key}
                    className={cn(
                      "flex flex-col items-center gap-1 text-center transition-opacity min-w-0",
                      !hasRank && "opacity-35 grayscale",
                    )}
                  >
                    <Image
                      loading="eager"
                      src={`/assets/images/rank-${rank.key}.svg`}
                      alt={rank.label}
                      width={112}
                      height={118}
                      className={cn(
                        "h-auto w-11 sm:w-14",
                        rank.key === positionSlug &&
                          "drop-shadow-[0_0_6px_var(--color-primary)]",
                      )}
                    />
                    <span className="w-full truncate text-[10px] font-medium sm:text-sm">
                      {rank.label}
                    </span>
                    <span className="w-full truncate text-[9px] text-muted-foreground sm:text-xs">
                      {rank.threshold} P.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-4 border border-border rounded-xl bg-card p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Tipp-Statistik</h2>
            <TipChart />
          </div>
        </div>
      </div>
    </main>
  );
}
