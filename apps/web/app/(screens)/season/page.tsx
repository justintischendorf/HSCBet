'use client';

import { Separator } from '@/components/ui/separator';
import { SeasonTable } from '@/components/season-table';
import { SeasonCombobox } from '@/components/season-combobox';

export default function SeasonScreen() {
  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Saison 2026/27</h1>
        <p className="text-base">
          Hier finden Sie Informationen zur aktuellen Saison wie auch zu
          vergangenen Saisons, einschließlich Spielplänen und Ergebnissen.
        </p>
        <Separator className="sm:my-8 my-6" />
        <div className="flex flex-col gap-6 md:gap-8">
          <SeasonCombobox />
          <SeasonTable />
        </div>
      </div>
    </main>
  );
}
