'use client';

import { Fragment } from 'react';
import { GameModel, TipModel } from '@repo/database';
import { TableCell, TableRow } from './ui/table';

interface TipProps {
  tipData: TipModel | null;
  gameData: GameModel;
}

export default function Tip({ tipData, gameData }: TipProps) {
  const dateObj = new Date(gameData.date);
  const dateStr = dateObj.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeOnly =
    dateObj.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' Uhr';

  return (
    <Fragment>
      <TableRow className="border-none hover:bg-transparent md:hidden">
        <TableCell
          colSpan={3}
          className="pt-3 pb-0 text-center text-xs text-muted-foreground"
        >
          {dateStr} · {timeOnly}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="hidden md:table-cell py-3">
          <div className="text-sm font-medium">{dateStr}</div>
          <div className="text-xs text-muted-foreground">{timeOnly}</div>
        </TableCell>
        <TableCell className="truncate text-right py-3 text-xs sm:text-sm font-semibold">
          {gameData.host}
        </TableCell>
        <TableCell className="text-center py-3 px-1 sm:px-2 font-bold tracking-wider text-sm sm:text-base">
          {tipData ? `${tipData.tipHost} : ${tipData.tipGuest}` : '- : -'}
        </TableCell>
        <TableCell className="truncate text-left py-3 text-xs sm:text-sm font-semibold">
          {gameData.guest}
        </TableCell>
      </TableRow>
    </Fragment>
  );
}
