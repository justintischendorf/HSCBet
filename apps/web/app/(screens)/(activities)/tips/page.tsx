import { SeasonCombobox } from '@/components/season-combobox';
import Tip from '@/components/tip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function TipsScreen() {
  return (
    <main className="w-full sm:py-16 py-8 px-4 md:px-12 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Meine Tipps</h1>
        <div className="flex sm:flex-row flex-col items-end justify-between gap-4">
          <p className="text-base">
            Hier findest du eine Übersicht über alle Tipps, die du bisher
            abgegeben hast. Du kannst die Tipps nach Saison filtern, um gezielt
            die Tipps einer bestimmten Saison anzuzeigen.
          </p>
          <Button className="w-full sm:w-auto">Tipp abgeben</Button>
        </div>
        <Separator className="sm:my-8 my-6" />
        <div className="flex flex-col gap-6 md:gap-8">
          <SeasonCombobox />
          <Tip></Tip>
        </div>
      </div>
    </main>
  );
}
