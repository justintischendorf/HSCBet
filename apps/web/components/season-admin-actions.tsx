"use client";

import { useMutation } from "@tanstack/react-query";
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { seasonsQueryKey } from "@/hooks/use-seasons";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";

import { ConfirmAlert } from "./confirm-alert";
import { EditGamePopup } from "./new-game-popup";
import { EditSeasonPopup } from "./new-season-popup";

type Season = {
  id: string;
  title: string;
  league: string;
  from: Date;
  to: Date;
};
type Game = {
  id: string;
  date: Date;
  host: string;
  guest: string;
  hostPoints: number | null;
  guestPoints: number | null;
};

function ActionsMenu({
  label,
  onEdit,
  onDelete,
}: {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    // non-modal, otherwise the dialog opened from it leaves the page unclickable
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label}>
          <EllipsisVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEdit}>
          <PencilIcon />
          Bearbeiten
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2Icon />
          Löschen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SeasonAdminActions({ season }: { season: Season }) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const { mutateAsync: deleteSeason } = useMutation({
    mutationFn: async () => apiClient.api.season({ id: season.id }).delete(),
  });

  async function handleDelete() {
    const { error } = await deleteSeason();
    if (error) {
      toast.error(error.status + ": " + error.value.message);
      return;
    }

    toast.success("Saison erfolgreich gelöscht!");
    queryClient.invalidateQueries({ queryKey: seasonsQueryKey });
  }

  return (
    <>
      <ActionsMenu
        label="Saison verwalten"
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />
      <EditSeasonPopup
        season={season}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <ConfirmAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Saison löschen?"
        message={`Die ${season.title} wird mit allen Spielen und den dazugehörigen Tipps endgültig gelöscht.`}
      />
    </>
  );
}

export function GameAdminActions({
  season,
  game,
}: {
  season: Season;
  game: Game;
}) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const { mutateAsync: deleteGame } = useMutation({
    mutationFn: async () =>
      apiClient.api
        .season({ id: season.id })
        .game({ gameId: game.id })
        .delete(),
  });

  async function handleDelete() {
    const { error } = await deleteGame();
    if (error) {
      toast.error(error.status + ": " + error.value.message);
      return;
    }

    toast.success("Spiel erfolgreich gelöscht!");
    queryClient.invalidateQueries({ queryKey: seasonsQueryKey });
  }

  return (
    <>
      <ActionsMenu
        label="Spiel verwalten"
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />
      <EditGamePopup
        season={season}
        game={game}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <ConfirmAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Spiel löschen?"
        message={`${game.host} gegen ${game.guest} wird mit allen Tipps zu diesem Spiel endgültig gelöscht.`}
      />
    </>
  );
}
