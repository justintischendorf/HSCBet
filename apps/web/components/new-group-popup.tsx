"use client";

import { useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { apiClient } from "@/lib/api-client";
import { useSession } from "@/lib/auth-client";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { MimeType } from "@repo/database";

import { InputGroupPicture, uploadGroupPicture } from "./input-group-picture";

export function NewGroupPopup() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">Gruppe erstellen</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Erstelle eine neue Gruppe</DialogTitle>
            <DialogDescription>
              Füge Informationen über deine neue Gruppe hinzu.
            </DialogDescription>
          </DialogHeader>
          <GroupForm setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full" variant="default">
          Gruppe erstellen
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Erstelle eine neue Gruppe</DrawerTitle>
          <DrawerDescription>
            Füge Informationen über deine neue Gruppe hinzu.
          </DrawerDescription>
        </DrawerHeader>
        <GroupForm className="p-4" setOpen={setOpen} />
      </DrawerContent>
    </Drawer>
  );
}

function GroupForm({
  className,
  setOpen,
}: React.ComponentProps<"form"> & {
  setOpen: (open: boolean) => void;
}) {
  const session = useSession();
  const user = session?.data?.user;
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [available, setAvailable] = React.useState(64);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [isUploadingPicture, setIsUploadingPicture] = React.useState(false);

  const { mutateAsync: getPresignedUrl } = useMutation({
    mutationFn: async (input: {
      filename: string;
      mimetype: MimeType;
      size: number;
    }) => {
      return apiClient.api.media.upload["get-presigned-url"].post(input);
    },
  });

  const { mutateAsync: createGroup, isPending: isCreatingGroup } = useMutation({
    mutationFn: async (input: {
      name: string;
      description: string;
      fileId: string | undefined;
      user: { id: string; name: string; email: string };
    }) => {
      return apiClient.api.group.post(input);
    },
  });

  async function handleGroupCreation() {
    let fileId: string | undefined;

    if (pendingFile) {
      setIsUploadingPicture(true);
      const uploaded = await uploadGroupPicture(pendingFile, getPresignedUrl);
      setIsUploadingPicture(false);

      if (!uploaded) return;
      fileId = uploaded.fileId;
    }

    const { error: groupError } = await createGroup({
      name,
      description,
      fileId,
      user: {
        id: user?.id ?? "",
        name: user?.name ?? "",
        email: user?.email ?? "",
      },
    });

    if (groupError) {
      toast.error(groupError.status + ": " + groupError.value.message);
      return;
    }

    toast.success("Gruppe erfolgreich erstellt!");
    setOpen(false);
    setPendingFile(null);
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  }

  return (
    <form
      className={cn("grid items-start gap-6", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        await handleGroupCreation();
      }}
    >
      <div className="grid place-content-center">
        <InputGroupPicture
          file={pendingFile}
          onFileChange={setPendingFile}
          fallbackChar={name.charAt(0).toUpperCase()}
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="name">Name</Label>
        <Input
          required
          type="text"
          maxLength={20}
          id="name"
          value={name}
          onChange={(e) => {
            e.preventDefault();
            setName(e.target.value);
          }}
        />
      </div>
      <div className="grid gap-3">
        <Field>
          <FieldLabel htmlFor="group-description">Beschreibung</FieldLabel>
          <div className="flex items-baseline justify-between">
            <FieldDescription>
              Ein kleiner Infotext zu deiner Gruppe
            </FieldDescription>
            <p className="text-sm">{available}</p>
          </div>
          <Textarea
            required
            id="group-description"
            placeholder="..."
            maxLength={64}
            value={description}
            onChange={(e) => {
              e.preventDefault();
              setDescription(e.target.value);
              setAvailable(64 - e.target.value.length);
            }}
          />
        </Field>
      </div>
      <Button type="submit" disabled={isCreatingGroup || isUploadingPicture}>
        {(isCreatingGroup || isUploadingPicture) && <Spinner />}
        Gruppe erstellen
      </Button>
    </form>
  );
}
