'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { TipModel } from '@repo/database';
import { EmptyTips } from '@/components/empty-tips';
import { NewTipPopup } from '@/components/new-tip-popup';

export default function TipsScreen() {
  const { data: seasonsResponse, isPending: isSeasonsPending } = useSeasons();

  const seasonsList = useMemo(() => {
    return seasonsResponse?.data?.season ?? [];
  }, [seasonsResponse?.data?.season]);

  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [tipsData, setTipsData] = useState<TipModel[]>([]);

  useEffect(() => {
    if (seasonsList.length > 0 && !selectedSeasonId) {
      setSelectedSeasonId(seasonsList[0].id);
    }
  }, [seasonsList, selectedSeasonId]);

  const fetchTips = useCallback(async () => {
    if (!selectedSeasonId) return;

    const { data: responseData, error: tipError } = await apiClient.api
      .tip({ id: selectedSeasonId })
      .get();

    if (tipError) {
      toast.error(`${tipError.status}: ${tipError.value}`);
      setTipsData([]);
      return;
    }
    setTipsData(responseData?.season ?? []);
  }, [selectedSeasonId]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const currentSeason = seasonsList.find((s) => s.id === selectedSeasonId);
  const selectedSeasonTitle = currentSeason?.title ?? '';

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Meine Tipps</h1>
        <div className="flex sm:flex-row flex-col items-end justify-between gap-4">
          <p className="text-base">
            Hier findest du eine Übersicht über alle Tipps, die du bisher
            abgegeben hast.
          </p>
          <NewTipPopup onTipCreated={fetchTips} />
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
          {tipsData.length > 0 ? (
            tipsData.map((tip) => {
              const matchingGame = currentSeason?.game.find(
                (g) => g.id === tip.gameId,
              );
              if (!matchingGame) return null;
              return <Tip key={tip.id} tipData={tip} gameData={matchingGame} />;
            })
          ) : (
            <EmptyTips />
          )}
        </div>
      </div>
    </main>
  );
}
