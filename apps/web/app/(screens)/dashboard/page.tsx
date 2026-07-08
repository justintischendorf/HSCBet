'use client';

import { TipChart } from '@/components/tip-chart';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const RANKS = [
  { key: 'bronze', label: 'Bronze', threshold: 200 },
  { key: 'silver', label: 'Silber', threshold: 400 },
  { key: 'gold', label: 'Gold', threshold: 600 },
  { key: 'platinum', label: 'Platin', threshold: 800 },
  { key: 'diamond', label: 'Diamant', threshold: 1000 },
] as const;

export default function DashboardScreen() {
  const session = useSession();
  const user = session?.data?.user;

  const points = 1000;
  const currentRank =
    [...RANKS].reverse().find((rank) => points >= rank.threshold) ??
    RANKS[0];

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">
          Hallo {user?.name}!
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
              <Image
                loading="eager"
                src={`/assets/images/rank-${currentRank.key}.svg`}
                alt={currentRank.label}
                width={88}
                height={93}
                className="shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Aktueller Rang
                </span>
                <h2 className="text-xl font-semibold">{currentRank.label}</h2>
                <span className="text-sm text-muted-foreground">
                  {points} Punkte
                </span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-5 gap-1.5 sm:gap-6">
              {RANKS.map((rank) => {
                const achieved = points >= rank.threshold;
                const isCurrent = rank.key === currentRank.key;
                return (
                  <div
                    key={rank.key}
                    className={cn(
                      'flex flex-col items-center gap-1 text-center transition-opacity min-w-0',
                      !achieved && 'opacity-35 grayscale',
                    )}
                  >
                    <Image
                      loading="eager"
                      src={`/assets/images/rank-${rank.key}.svg`}
                      alt={rank.label}
                      width={112}
                      height={118}
                      className={cn(
                        'h-auto w-11 sm:w-14',
                        isCurrent && 'drop-shadow-[0_0_6px_var(--color-primary)]',
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
