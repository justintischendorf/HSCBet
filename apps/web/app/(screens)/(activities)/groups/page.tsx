'use client';

import Group from '@/components/group';
import { NewGroupPopup } from '@/components/new-group-popup';
import { Separator } from '@/components/ui/separator';

export default function GroupsScreen() {
  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Meine Gruppen</h1>
        <div className="flex sm:flex-row flex-col items-end justify-between gap-4">
          <p className="text-base">
            Hier findest du eine Übersicht über alle Gruppen, in denen du
            Mitglied bist. Außerdem kannst du neue Gruppen erstellen oder
            bestehenden Gruppen beitreten.
          </p>
          <NewGroupPopup />
        </div>
        <Separator className="sm:my-8 my-6" />
        <div className="justify-between flex sm:flex-row flex-col flex-wrap gap-4">
          <Group></Group>
          <Group></Group>
          <Group></Group>
        </div>
      </div>
    </main>
  );
}
