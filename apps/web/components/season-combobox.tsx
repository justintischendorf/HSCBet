'use client';

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

const seasons = ['2026/27', '2025/26', '2024/25'] as const;

export function SeasonCombobox() {
  return (
    <Combobox items={seasons}>
      <ComboboxInput placeholder="Wähle eine Saison" />
      <ComboboxContent>
        <ComboboxEmpty>Keine Saison gefunden.</ComboboxEmpty>
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
