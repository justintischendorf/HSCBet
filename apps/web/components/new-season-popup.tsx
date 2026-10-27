"use client";

import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { type DateRange } from "react-day-picker";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { seasonsQueryKey, useSeasons } from "@/hooks/use-seasons";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

import { ResponsiveDialog } from "./responsive-dialog";

const LEAGUES = ["1. Bundesliga", "2. Bundesliga"] as const;
type League = (typeof LEAGUES)[number];

type Season = {
  id: string;
  title: string;
  league: string;
  from: Date;
  to: Date;
};

function isLeague(value: string): value is League {
  return (LEAGUES as readonly string[]).includes(value);
}

// derives the next title from the latest season, e.g. "Saison 2026/2027" -> "Saison 2027/28"
function getNextSeasonTitle(seasons: { title: string; from: Date }[]) {
  const latest = [...seasons].sort(
    (a, b) => new Date(b.from).getTime() - new Date(a.from).getTime(),
  )[0];

  let startYear: number;
  if (latest) {
    const match = latest.title.match(/(\d{4})\s*\//);
    startYear =
      (match ? Number(match[1]) : new Date(latest.from).getFullYear()) + 1;
  } else {
    // seasons start in summer, before July the current season began last year
    const now = new Date();
    startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  }

  const endYear = String(startYear + 1).slice(-2);
  return `Saison ${startYear}/${endYear}`;
}

export function NewSeasonPopup() {
  const [open, setOpen] = React.useState(false);
  const isAdmin = useIsAdmin();

  // the API enforces this as well, hiding the button is only for the UI
  if (!isAdmin) return null;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button className="w-full sm:w-auto" variant="default">
          Saison erstellen
        </Button>
      }
      title="Erstelle eine neue Saison"
      description="Füge Informationen über die neue Saison hinzu."
    >
      {(className) => <SeasonForm className={className} setOpen={setOpen} />}
    </ResponsiveDialog>
  );
}

export function EditSeasonPopup({
  season,
  open,
  onOpenChange,
}: {
  season: Season;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Saison bearbeiten"
      description={`Ändere die Informationen der ${season.title}.`}
    >
      {(className) => (
        <SeasonForm
          className={className}
          season={season}
          setOpen={onOpenChange}
        />
      )}
    </ResponsiveDialog>
  );
}

function SeasonForm({
  className,
  season,
  setOpen,
}: React.ComponentProps<"form"> & {
  season?: Season;
  setOpen: (open: boolean) => void;
}) {
  const { data: seasonsResponse } = useSeasons();
  const [title, setTitle] = React.useState(
    () =>
      season?.title ?? getNextSeasonTitle(seasonsResponse?.data?.season ?? []),
  );
  const portalRef = React.useRef<HTMLDivElement>(null);
  const [league, setLeague] = React.useState<League | null>(
    season && isLeague(season.league) ? season.league : null,
  );
  const [range, setRange] = React.useState<DateRange | undefined>(
    season
      ? { from: new Date(season.from), to: new Date(season.to) }
      : undefined,
  );
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const { mutateAsync: saveSeason, isPending: isSavingSeason } = useMutation({
    mutationFn: async (input: {
      title: string;
      league: League;
      from: Date;
      to: Date;
    }) => {
      return season
        ? apiClient.api.season({ id: season.id }).patch(input)
        : apiClient.api.season.post(input);
    },
  });

  async function handleSeasonSubmit() {
    if (!league) {
      toast.error("Bitte wähle eine Liga aus.");
      return;
    }

    if (!range?.from || !range?.to) {
      toast.error("Bitte wähle einen Zeitraum für die Saison aus.");
      return;
    }

    const { error } = await saveSeason({
      title,
      league,
      from: range.from,
      to: range.to,
    });

    if (error) {
      toast.error(error.status + ": " + error.value.message);
      return;
    }

    toast.success(
      season
        ? "Saison erfolgreich gespeichert!"
        : "Saison erfolgreich erstellt!",
    );
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: seasonsQueryKey });
  }

  return (
    <form
      className={cn("grid items-start gap-6", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        await handleSeasonSubmit();
      }}
    >
      <div className="grid gap-3">
        <Field>
          <FieldLabel htmlFor="title">Titel</FieldLabel>
          <FieldDescription>z.B. Saison 2026/27</FieldDescription>
          <Input
            required
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-3">
        <Field>
          <FieldLabel htmlFor="league">Liga</FieldLabel>
          <FieldDescription>Die Liga, in der gespielt wird</FieldDescription>
          <Combobox
            items={[...LEAGUES]}
            value={league}
            onValueChange={(val) => setLeague(val)}
          >
            <ComboboxInput id="league" placeholder="Wähle eine Liga" />
            {/* render inside the dialog, the modal dialog blocks clicks on portals in body */}
            <ComboboxContent container={portalRef}>
              <ComboboxList>
                {(item: League) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
      </div>
      <div className="grid gap-3">
        <Field>
          <FieldLabel htmlFor="range">Zeitraum</FieldLabel>
          <FieldDescription>Start- und Enddatum der Saison</FieldDescription>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen} modal>
            <PopoverTrigger asChild>
              <Button
                id="range"
                type="button"
                variant="outline"
                className={cn(
                  "justify-start font-normal",
                  !range?.from && "text-muted-foreground",
                )}
              >
                <CalendarIcon />
                {range?.from
                  ? range.to
                    ? `${format(range.from, "dd.MM.yyyy")} – ${format(range.to, "dd.MM.yyyy")}`
                    : format(range.from, "dd.MM.yyyy")
                  : "Zeitraum auswählen"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                locale={de}
                defaultMonth={range?.from}
                selected={range}
                onSelect={setRange}
                numberOfMonths={1}
                fixedWeeks
              />
            </PopoverContent>
          </Popover>
        </Field>
      </div>
      {/* out of flow, so the portal's wrapper doesn't add grid rows and shift the dialog */}
      <div ref={portalRef} className="absolute" />
      <Button type="submit" disabled={isSavingSeason}>
        {isSavingSeason && <Spinner />}
        {season ? "Speichern" : "Saison erstellen"}
      </Button>
    </form>
  );
}
