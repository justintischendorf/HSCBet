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
import { GroupDescriptionTextarea } from './group-description-textarea';

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
          <GroupForm />
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
        <GroupForm className="p-4" />
      </DrawerContent>
    </Drawer>
  );
}

function GroupForm({ className }: React.ComponentProps<'form'>) {
  return (
    <form
      className={cn('grid items-start gap-6', className)}
      onSubmit={async (e) => {
        e.preventDefault();
        await handleGroupCreation();
      }}
    >
      <div className="grid place-content-center">
        <InputGroupPicture />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="name">Name</Label>
        <Input required type="text" id="name" />
      </div>
      <div className="grid gap-3">
        <GroupDescriptionTextarea />
      </div>
      <Button type="submit">Gruppe erstellen</Button>
    </form>
  );
}

async function handleGroupCreation() {
  console.log('Group creation logic goes here');
}
