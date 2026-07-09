import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { NewGroupPopup } from './new-group-popup';
import { Users } from 'lucide-react';

export function EmptyGroups() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users />
        </EmptyMedia>
        <EmptyTitle className="text-base">Keine Gruppen vorhanden</EmptyTitle>
        <EmptyDescription className="text-sm">
          Du bist in keiner Gruppe Mitglied. Erstelle eine neue Gruppe oder
          trete einer bestehenden Gruppe bei.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <NewGroupPopup />
      </EmptyContent>
      <Button variant="link" className="text-muted-foreground" />
    </Empty>
  );
}
