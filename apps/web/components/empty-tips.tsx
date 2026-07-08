import { ArrowUpRightIcon, Folder } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { NewTipPopup } from './new-tip-popup';

export function EmptyTips() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Folder />
        </EmptyMedia>
        <EmptyTitle className="text-base">Keine Tipps vorhanden</EmptyTitle>
        <EmptyDescription className="text-sm">
          Du hast noch keine Tipps abgegeben. Fang an, indem du deinen ersten
          Tipp abgibst.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <NewTipPopup />
      </EmptyContent>
      <Button variant="link" className="text-muted-foreground" />
    </Empty>
  );
}
