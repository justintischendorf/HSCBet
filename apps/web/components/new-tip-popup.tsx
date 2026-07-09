'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from './ui/combobox';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSeasons } from '@/hooks/use-seasons';
import { apiClient } from '@/lib/api-client';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';

interface NewTipPopupProps {
  onTipCreated?: () => void;
}

export function NewTipPopup({ onTipCreated }: NewTipPopupProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleCreated = () => {
    setOpen(false);
    onTipCreated?.();
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">Tipp abgeben</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Tipp abgeben</DialogTitle>
            <DialogDescription>
              Tippe auf künftige Spiele des HSC 2000 Coburg
            </DialogDescription>
          </DialogHeader>
          <TipForm onTipCreated={handleCreated} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full md:w-auto" variant="default">
          Tipp abgeben
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Tipp abgeben</DrawerTitle>
          <DrawerDescription>
            Tippe auf künftige Spiele des HSC 2000 Coburg
          </DrawerDescription>
        </DrawerHeader>
        <TipForm className="p-4" onTipCreated={handleCreated} />
      </DrawerContent>
    </Drawer>
  );
}

interface TipFormProps extends React.ComponentProps<'form'> {
  onTipCreated: () => void;
}

function TipForm({ className, onTipCreated }: TipFormProps) {
  const comboboxContainerRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const { data: seasonsResponse, isPending: isSeasonsPending } = useSeasons();

  const seasonsList = useMemo(() => {
    return seasonsResponse?.data?.season ?? [];
  }, [seasonsResponse?.data?.season]);

  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [tipHost, setTipHost] = useState<string>('');
  const [tipGuest, setTipGuest] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tippedGameIds, setTippedGameIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (seasonsList.length > 0 && !selectedSeasonId) {
      setSelectedSeasonId(seasonsList[0].id);
    }
  }, [seasonsList, selectedSeasonId]);

  const userId = session?.user.id;

  useEffect(() => {
    const fetchTippedGames = async () => {
      if (!selectedSeasonId || !userId) {
        setTippedGameIds(new Set());
        return;
      }

      const { data, error } = await apiClient.api
        .tip({ id: selectedSeasonId })
        .get();

      if (error) {
        setTippedGameIds(new Set());
        return;
      }

      setTippedGameIds(
        new Set(
          (data?.season ?? [])
            .filter((tip) => tip.userId === userId)
            .map((tip) => tip.gameId),
        ),
      );
    };

    fetchTippedGames();
  }, [selectedSeasonId, userId]);

  const currentSeason = seasonsList.find((s) => s.id === selectedSeasonId);
  const selectedSeasonTitle = currentSeason?.title ?? '';

  const gamesList = useMemo(
    () => (currentSeason?.game ?? []).filter((g) => !tippedGameIds.has(g.id)),
    [currentSeason, tippedGameIds],
  );
  const currentGame = gamesList.find((g) => g.id === selectedGameId);
  const selectedGameTitle = currentGame
    ? `${currentGame.host} : ${currentGame.guest}`
    : '';

  useEffect(() => {
    setSelectedGameId('');
  }, [selectedSeasonId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSeasonId || !selectedGameId || !userId) return;

    setIsSubmitting(true);
    const { error } = await apiClient.api.tip.post({
      seasonId: selectedSeasonId,
      gameId: selectedGameId,
      userId,
      tipHost: Number(tipHost),
      tipGuest: Number(tipGuest),
    });
    setIsSubmitting(false);

    if (error) {
      const message =
        error.value &&
        typeof error.value === 'object' &&
        'message' in error.value
          ? String(error.value.message)
          : `${error.status}: ${error.value}`;
      toast.error(message);
      return;
    }

    toast.success('Tipp erfolgreich abgegeben');
    setSelectedGameId('');
    setTipHost('');
    setTipGuest('');
    onTipCreated();
  };

  return (
    <form
      className={cn('grid items-start gap-6', className)}
      onSubmit={handleSubmit}
    >
      <div ref={comboboxContainerRef} className="absolute" />
      <div className="grid gap-3">
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
          <ComboboxContent container={comboboxContainerRef}>
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
      <div className="grid gap-3">
        <Combobox
          items={gamesList}
          disabled={!selectedSeasonId || gamesList.length === 0}
          value={selectedGameId}
          onValueChange={(val) => setSelectedGameId(val ?? '')}
        >
          <ComboboxInput
            placeholder="Wähle ein Spiel"
            value={selectedGameTitle}
          />
          <ComboboxContent container={comboboxContainerRef}>
            <ComboboxEmpty>Kein Spiel gefunden.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.id} value={item.id}>
                  <div className="flex flex-col">
                    <span>
                      {item.host} : {item.guest}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <div className="flex items-center flex-row justify-between">
        <div className="w-[45%]">
          <label>{currentGame?.host ?? 'Heimteam'}</label>
          <Input
            required
            type="number"
            min={0}
            max={99}
            disabled={!selectedGameId}
            value={tipHost}
            onChange={(e) => setTipHost(e.target.value)}
          />
        </div>
        <div className="w-[45%]">
          <label>{currentGame?.guest ?? 'Auswärtsteam'}</label>
          <Input
            required
            type="number"
            min={0}
            max={99}
            disabled={!selectedGameId}
            value={tipGuest}
            onChange={(e) => setTipGuest(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" disabled={!selectedGameId || isSubmitting}>
        {isSubmitting ? 'Tipp wird abgegeben...' : 'Tipp abgeben'}
      </Button>
    </form>
  );
}
