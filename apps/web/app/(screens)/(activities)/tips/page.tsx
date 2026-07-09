'use client';

import { useState, useEffect, useMemo } from 'react';
import Tip from '@/components/tip';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Separator } from '@/components/ui/separator';
import { useSeasons } from '@/hooks/use-seasons';
import { useTips } from '@/hooks/use-tips';
import { toast } from 'sonner';
import { EmptyTips } from '@/components/empty-tips';
import { NewTipPopup } from '@/components/new-tip-popup';
import { Skeleton } from '@/components/ui/skeleton';

export default function TipsScreen() {
  const { data: seasonsResponse, isPending: isSeasonsPending } = useSeasons();

  const seasonsList = useMemo(() => {
    return seasonsResponse?.data?.season ?? [];
  }, [seasonsResponse?.data?.season]);

  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');

  useEffect(() => {
    if (seasonsList.length > 0 && !selectedSeasonId) {
      setSelectedSeasonId(seasonsList[0].id);
    }
  }, [seasonsList, selectedSeasonId]);

  const {
    data: tipsResponse,
    isPending: isTipsPending,
    refetch: refetchTips,
  } = useTips(selectedSeasonId);
  const tipsData = useMemo(
    () => tipsResponse?.data?.season ?? [],
    [tipsResponse?.data?.season],
  );

  useEffect(() => {
    if (tipsResponse?.error) {
      toast.error(
        `${tipsResponse.error.status}: ${tipsResponse.error.value}`,
      );
    }
  }, [tipsResponse?.error]);

  const currentSeason = seasonsList.find((s) => s.id === selectedSeasonId);
  const selectedSeasonTitle = currentSeason?.title ?? '';

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Meine Tipps</h1>
        <div className="flex sm:flex-row flex-col items-end justify-between gap-4">
          <p className="text-base flex-1 min-w-0">
            Hier findest du eine Übersicht über alle Tipps, die du bisher
            abgegeben hast.
          </p>
          <div className="shrink-0">
            <NewTipPopup onTipCreated={refetchTips} />
          </div>
        </div>
        <Separator className="sm:my-8 my-6" />
        <div className="flex flex-col gap-6 md:gap-8">
          <Combobox
            items={seasonsList}
            disabled={isSeasonsPending}
            value={selectedSeasonId}
            onValueChange={(val) => setSelectedSeasonId(val ?? '')}
          >
            <ComboboxInput
              placeholder="Wähle eine Saison"
              value={isSeasonsPending ? 'Laden...' : selectedSeasonTitle}
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
          {isTipsPending ? (
            <Skeleton className="h-96 w-full" />
          ) : tipsData.length > 0 ? (
            tipsData.map((tip) => {
              const matchingGame = currentSeason?.game.find(
                (g) => g.id === tip.gameId,
              );
              if (!matchingGame) return null;
              return <Tip key={tip.id} tipData={tip} gameData={matchingGame} />;
            })
          ) : (
            <div className="mt-20">
              <EmptyTips />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
