"use client";

import { useMutation } from "@tanstack/react-query";
import { KeyRound, UserPlus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

export function InviteMemberPopup({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
            <UserPlus />
            Spieler einladen
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <div className="mx-auto mb-1 flex size-14 items-center justify-center rounded-full bg-huk-accent/15">
              <UserPlus className="size-6 text-huk-accent" />
            </div>
            <DialogTitle className="text-center">Spieler einladen</DialogTitle>
            <DialogDescription className="text-center">
              Lade einen Spieler anhand seiner Spieler-ID in {groupName} ein.
            </DialogDescription>
          </DialogHeader>
          <InviteForm groupId={groupId} setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
          <UserPlus />
          Spieler einladen
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <div className="mx-auto mb-1 flex size-14 items-center justify-center rounded-full bg-huk-accent/15">
            <UserPlus className="size-6 text-huk-accent" />
          </div>
          <DrawerTitle className="text-center">Spieler einladen</DrawerTitle>
          <DrawerDescription className="text-center">
            Lade einen Spieler anhand seiner Spieler-ID in {groupName} ein.
          </DrawerDescription>
        </DrawerHeader>
        <InviteForm className="p-4" groupId={groupId} setOpen={setOpen} />
      </DrawerContent>
    </Drawer>
  );
}

function InviteForm({
  className,
  groupId,
  setOpen,
}: React.ComponentProps<"form"> & {
  groupId: string;
  setOpen: (open: boolean) => void;
}) {
  const [playerId, setPlayerId] = React.useState("");

  const { mutateAsync: invitePlayer, isPending: isInviting } = useMutation({
    mutationFn: async (input: { playerId: string }) => {
      return apiClient.api.group({ id: groupId }).invite.post(input);
    },
  });

  async function handleInvite() {
    const { error } = await invitePlayer({ playerId });

    if (error) {
      toast.error(error.status + ": " + error.value.message);
      return;
    }

    toast.success("Einladung erfolgreich versendet!");
    setOpen(false);
    setPlayerId("");
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  }

  return (
    <form
      className={cn("grid items-start gap-6", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        await handleInvite();
      }}
    >
      <Field>
        <FieldLabel htmlFor="player-id">Spieler-ID</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <KeyRound />
          </InputGroupAddon>
          <InputGroupInput
            required
            type="text"
            id="player-id"
            placeholder="z. B. MHonM17FULo9MYD1iCMErRBeZrJzgF7F"
            className="font-mono text-sm"
            value={playerId}
            onChange={(e) => {
              e.preventDefault();
              setPlayerId(e.target.value);
            }}
          />
        </InputGroup>
        <FieldDescription>
          Die Spieler-ID findet dein Freund in seinen Kontoeinstellungen.
        </FieldDescription>
      </Field>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setOpen(false)}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isInviting || !playerId}
        >
          {isInviting && <Spinner />}
          Einladen
        </Button>
      </div>
    </form>
  );
}
