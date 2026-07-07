import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

export function GroupDescriptionTextarea() {
  const [length, setLength] = React.useState(0);
  const [available, setAvailable] = React.useState(32);

  return (
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
        maxLength={32}
        onChange={(e) => {
          setLength(e.target.value.length);
          setAvailable(32 - e.target.value.length);
        }}
      />
    </Field>
  );
}
