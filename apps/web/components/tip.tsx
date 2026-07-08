'use client';

import { GameModel, TipModel } from '@repo/database';
import { CircleX } from 'lucide-react';

interface TipProps {
  tipData: TipModel;
  gameData: GameModel;
}

export default function Tip({ tipData, gameData }: TipProps) {
  return (
    <div className="flex flex-col gap-2 border border-border rounded-xl bg-card p-4 shadow-sm relative">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between">
        <div className="flex flex-row items-baseline sm:gap-3 gap-2 text-lg font-bold">
          <span className="text-sm sm:text-base font-bold">
            {gameData.host}
          </span>
          <span className="text-sm sm:text-base font-bold text-muted-foreground">
            {gameData.hostPoints}
          </span>
          <span className="text-sm sm:text-base font-bold">:</span>
          <span className="text-sm sm:text-base font-bold text-muted-foreground">
            {gameData.guestPoints}
          </span>
          <span className="text-sm sm:text-base font-bold">
            {gameData.guest}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {new Date(gameData.date).toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          Uhr
        </span>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <CircleX size={18} className="text-destructive shrink-0" />
        <p className="text-sm">
          Dein Tipp: {tipData.tipHost} : {tipData.tipGuest}
        </p>
      </div>
    </div>
  );
}
