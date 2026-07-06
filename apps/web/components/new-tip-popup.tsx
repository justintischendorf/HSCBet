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
import { SeasonCombobox } from './season-combobox';
import { GameCombobox } from './game-combobox';

export function NewTipPopup() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

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
          <GroupForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full" variant="default">
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
      <div className="grid gap-3">
        <SeasonCombobox />
      </div>
      <div className="grid gap-3">
        <GameCombobox />
      </div>
      <div className="flex items-center flex-row justify-between">
        <div className="w-[45%]">
          <label>Heimteam</label>
          <Input required type="number" placeholder="..." />
        </div>
        <div className="w-[45%]">
          <label>Auswärtsteam</label>
          <Input required type="number" placeholder="..." />
        </div>
      </div>

      <Button type="submit">Tipp abgeben</Button>
    </form>
  );
}

async function handleGroupCreation() {
  console.log('Group creation logic goes here');
}
