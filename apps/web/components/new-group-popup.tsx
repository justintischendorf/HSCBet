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
import { Label } from '@/components/ui/label';
import { InputGroupPicture } from './input-group-picture';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import { queryClient } from '@/lib/queryClient';

export function NewGroupPopup() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

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
}: React.ComponentProps<'form'> & {
  setOpen: (open: boolean) => void;
}) {
  const session = useSession();
  const user = session?.data?.user;
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [length, setLength] = React.useState(0);
  const [available, setAvailable] = React.useState(64);
  const [fileId, setFileId] = React.useState<string | undefined>();

  async function handleGroupCreation() {
    const { data: group, error: groupError } = await apiClient.api.group.post({
      name,
      description,
      fileId,
      user: {
        id: user?.id ?? '',
        name: user?.name ?? '',
        email: user?.email ?? '',
      },
    });

    if (groupError) {
      toast.error(groupError.status + ': ' + groupError.value.message);
      return;
    }

    toast.success('Gruppe erfolgreich erstellt!');
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ['groups'] });
  }

  return (
    <form
      className={cn('grid items-start gap-6', className)}
      onSubmit={async (e) => {
        e.preventDefault();
        await handleGroupCreation();
      }}
    >
      <div className="grid place-content-center">
        <InputGroupPicture
          fileId={fileId}
          onFileIdChange={setFileId}
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
              setLength(e.target.value.length);
              setAvailable(64 - e.target.value.length);
            }}
          />
        </Field>
      </div>
      <Button type="submit">Gruppe erstellen</Button>
    </form>
  );
}
