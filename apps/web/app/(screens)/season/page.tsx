'use client';

import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { SeasonTable } from '@/components/season-table';
import { useSeasons } from '@/hooks/use-seasons';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Skeleton } from '@/components/ui/skeleton';

export default function SeasonScreen() {
  const { data: seasonsResponse, isPending: isSeasonsPending } = useSeasons();
  const seasonsData = seasonsResponse?.data?.season;
  const seasonsList = seasonsData ?? [];
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');

  useEffect(() => {
    if (seasonsData && seasonsData.length > 0 && !selectedSeasonId) {
      setSelectedSeasonId(seasonsData[0].id);
    }
  }, [seasonsData, selectedSeasonId]);

  const currentSeason = seasonsList.find((s) => s.id === selectedSeasonId);
  const selectedSeasonTitle = currentSeason?.title || '';

  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-1">
          <span className="text-lg">
            {isSeasonsPending ? (
              <Skeleton className="h-6 w-46" />
            ) : (
              currentSeason?.league
            )}
          </span>
          <div className="flex sm:flex-row flex-col sm:gap-2 gap-0 items-baseline">
            <h1 className="text-3xl font-bold tracking-tight">
              {isSeasonsPending ? (
                <Skeleton className="h-10 w-58 mb-1 sm:mb-0" />
              ) : (
                currentSeason?.title
              )}
            </h1>
            <span className="text-muted-foreground sm:text-sm text-xs">
              {isSeasonsPending ? (
                <Skeleton className="sm:h-4 sm:w-42 h-3 w-34" />
              ) : currentSeason ? (
                `${new Date(currentSeason.from).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${new Date(currentSeason.to).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
              ) : (
                ''
              )}
            </span>
          </div>
        </div>
        <p className="text-base mt-2">
          Hier finden Sie Informationen zur aktuellen Saison wie auch zu
          vergangenen Saisons, einschließlich Spielpläne und Ergebnissen.
        </p>
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

          {isSeasonsPending ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <SeasonTable
              games={isSeasonsPending ? [] : (currentSeason?.game ?? [])}
            />
          )}
        </div>
      </div>
    </main>
  );
}
