"use client";

import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { seasonsQueryKey } from "@/hooks/use-seasons";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

import { ResponsiveDialog } from "./responsive-dialog";

export const CLUB = "HSC 2000 Coburg";

type Season = { id: string; title: string; from: Date; to: Date };
type Game = { id: string; date: Date; host: string; guest: string };

export function NewGamePopup({ season }: { season: Season | undefined }) {
  const [open, setOpen] = React.useState(false);
  const isAdmin = useIsAdmin();

  // the API enforces this as well, hiding the button is only for the UI
  if (!isAdmin || !season) return null;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button className="w-full sm:w-auto" variant="outline">
          Spiel hinzufügen
        </Button>
      }
      title="Neues Spiel"
      description={`Füge ein Spiel zur ${season.title} hinzu.`}
    >
      {(className) => (
        <GameForm className={className} season={season} setOpen={setOpen} />
      )}
    </ResponsiveDialog>
  );
}

export function EditGamePopup({
  season,
  game,
  open,
  onOpenChange,
}: {
  season: Season;
  game: Game;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Spiel bearbeiten"
      description={`${game.host} gegen ${game.guest}`}
    >
      {(className) => (
        <GameForm
          className={className}
          season={season}
          game={game}
          setOpen={onOpenChange}
        />
      )}
    </ResponsiveDialog>
  );
}

function GameForm({
  className,
  season,
  game,
  setOpen,
}: React.ComponentProps<"form"> & {
  season: Season;
  game?: Game;
  setOpen: (open: boolean) => void;
}) {
  const gameIsHome = game ? game.host === CLUB : true;
  const [date, setDate] = React.useState<Date | undefined>(
    game ? new Date(game.date) : undefined,
  );
  const [time, setTime] = React.useState(
    game ? format(new Date(game.date), "HH:mm") : "",
  );
  const [opponent, setOpponent] = React.useState(
    game ? (gameIsHome ? game.guest : game.host) : "",
  );
  const [isHome, setIsHome] = React.useState(gameIsHome);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const seasonFrom = new Date(season.from);
  const seasonTo = new Date(season.to);

  const { mutateAsync: saveGame, isPending: isSavingGame } = useMutation({
    mutationFn: async (input: { date: Date; host: string; guest: string }) => {
      const seasonApi = apiClient.api.season({ id: season.id });
      return game
        ? seasonApi.game({ gameId: game.id }).patch(input)
        : seasonApi.game.post(input);
    },
  });

  async function handleGameSubmit() {
    if (!date) {
      toast.error("Bitte wähle ein Datum für das Spiel aus.");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const kickoff = new Date(date);
    kickoff.setHours(hours ?? 0, minutes ?? 0, 0, 0);

    const { error } = await saveGame({
      date: kickoff,
      host: isHome ? CLUB : opponent,
      guest: isHome ? opponent : CLUB,
    });

    if (error) {
      toast.error(error.status + ": " + error.value.message);
      return;
    }

    toast.success(
      game
        ? "Spiel erfolgreich gespeichert!"
        : "Spiel erfolgreich hinzugefügt!",
    );
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: seasonsQueryKey });
  }

  return (
    <form
      className={cn("grid items-start gap-6", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        await handleGameSubmit();
      }}
    >
      <div className="grid gap-3">
        <Field>
          <FieldLabel htmlFor="opponent">Gegner</FieldLabel>
          <FieldDescription>Die gegnerische Mannschaft</FieldDescription>
          <Input
            required
            type="text"
            id="opponent"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-3">
        <Field>
          <FieldLabel>Spielort</FieldLabel>
          <FieldDescription>
            Spielt der {CLUB} zu Hause oder auswärts?
          </FieldDescription>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={isHome ? "default" : "outline"}
              onClick={() => setIsHome(true)}
            >
              Heimspiel
            </Button>
            <Button
              type="button"
              variant={isHome ? "outline" : "default"}
              onClick={() => setIsHome(false)}
            >
              Auswärtsspiel
            </Button>
          </div>
        </Field>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Field>
          <FieldLabel htmlFor="date">Datum</FieldLabel>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen} modal>
            <PopoverTrigger asChild>
              <Button
                id="date"
                type="button"
                variant="outline"
                className={cn(
                  "justify-start font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon />
                {date ? format(date, "dd.MM.yyyy") : "Datum auswählen"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={de}
                defaultMonth={date ?? seasonFrom}
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  setCalendarOpen(false);
                }}
                startMonth={seasonFrom}
                endMonth={seasonTo}
                disabled={{ before: seasonFrom, after: seasonTo }}
                numberOfMonths={1}
                fixedWeeks
              />
            </PopoverContent>
          </Popover>
        </Field>
        <Field>
          <FieldLabel htmlFor="time">Uhrzeit</FieldLabel>
          <Input
            required
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
          />
        </Field>
      </div>
      <Button type="submit" disabled={isSavingGame}>
        {isSavingGame && <Spinner />}
        {game ? "Speichern" : "Spiel hinzufügen"}
      </Button>
    </form>
  );
}
