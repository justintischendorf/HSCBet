'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

const games = ['Spiel 1', 'Spiel 2', 'Spiel 3'] as const;

export function GameCombobox() {
  return (
    <Combobox items={games}>
      <ComboboxInput placeholder="Wähle ein Spiel" />
      <ComboboxContent>
        <ComboboxEmpty>Kein Spiel gefunden.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
