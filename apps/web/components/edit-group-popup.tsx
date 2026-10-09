"use client";

import { useMutation } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { MimeType } from "@repo/database";

import { InputGroupPicture, uploadGroupPicture } from "./input-group-picture";

type EditableGroup = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | undefined;
};

export function EditGroupPopup({ group }: { group: EditableGroup }) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const trigger = (
    <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
      <Pencil />
      Gruppe bearbeiten
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Gruppe bearbeiten</DialogTitle>
            <DialogDescription>
              Passe Bild, Name und Beschreibung von {group.name} an.
            </DialogDescription>
          </DialogHeader>
          {open && <EditGroupForm group={group} setOpen={setOpen} />}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Gruppe bearbeiten</DrawerTitle>
          <DrawerDescription>
            Passe Bild, Name und Beschreibung von {group.name} an.
          </DrawerDescription>
        </DrawerHeader>
        {open && (
          <EditGroupForm className="p-4" group={group} setOpen={setOpen} />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function EditGroupForm({
  className,
  group,
  setOpen,
}: React.ComponentProps<"form"> & {
  group: EditableGroup;
  setOpen: (open: boolean) => void;
}) {
  const [name, setName] = React.useState(group.name);
  const [description, setDescription] = React.useState(group.description);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [removePicture, setRemovePicture] = React.useState(false);
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

  const { mutateAsync: editGroup, isPending: isEditingGroup } = useMutation({
    mutationFn: async (input: {
      groupId: string;
      name: string;
      description: string;
      fileId?: string | null;
    }) => {
      return apiClient.api.group.editGroup.patch(input);
    },
  });

  async function handleGroupEdit() {
    let fileId: string | null | undefined;

    if (pendingFile) {
      setIsUploadingPicture(true);
      const uploaded = await uploadGroupPicture(pendingFile, getPresignedUrl);
      setIsUploadingPicture(false);

      if (!uploaded) return;
      fileId = uploaded.fileId;
    } else if (removePicture && group.imageUrl) {
      fileId = null;
    }

    const { error: editError } = await editGroup({
      groupId: group.id,
      name,
      description,
      fileId,
    });

    if (editError) {
      toast.error(editError.status + ": " + editError.value.message);
      return;
    }

    toast.success("Gruppe erfolgreich bearbeitet!");
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["groups"] });
  }

  return (
    <form
      className={cn("grid items-start gap-6", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        await handleGroupEdit();
      }}
    >
      <div className="grid place-content-center">
        <InputGroupPicture
          file={pendingFile}
          onFileChange={(file) => {
            setPendingFile(file);
            setRemovePicture(file === null);
          }}
          fallbackChar={name.charAt(0).toUpperCase()}
          initialImageUrl={removePicture ? undefined : group.imageUrl}
        />
      </div>
      <div className="grid gap-3">
        <Field>
          <FieldLabel htmlFor="edit-group-name">Name</FieldLabel>
          <div className="flex items-baseline justify-between">
            <FieldDescription>Der Name deiner Gruppe</FieldDescription>
            <p className="text-sm">{18 - name.length}</p>
          </div>
          <Input
            required
            type="text"
            maxLength={18}
            id="edit-group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid gap-3">
        <Field>
          <FieldLabel htmlFor="edit-group-description">Beschreibung</FieldLabel>
          <div className="flex items-baseline justify-between">
            <FieldDescription>
              Ein kleiner Infotext zu deiner Gruppe
            </FieldDescription>
            <p className="text-sm">{64 - description.length}</p>
          </div>
          <Textarea
            required
            id="edit-group-description"
            placeholder="..."
            maxLength={64}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
      </div>
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
          disabled={isEditingGroup || isUploadingPicture || !name}
        >
          {(isEditingGroup || isUploadingPicture) && <Spinner />}
          Speichern
        </Button>
      </div>
    </form>
  );
}
