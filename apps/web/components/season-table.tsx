import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GameModel } from '@repo/database';

export function SeasonTable({ games }: { games: GameModel[] }) {
  return (
    <div className="w-full">
      <h3 className="text-md font-semibold mb-4 md:hidden px-1">
        Alle neuesten Entwicklungen
      </h3>

      <div className="flex flex-col gap-3 md:hidden">
        {games.map((game) => {
          const dateObj = new Date(game.date);
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

          const isCoburgHome = game.host === 'HSC 2000 Coburg';
          const isCoburgAway = game.guest === 'HSC 2000 Coburg';

          const hasPlayed =
            game.hostPoints !== null && game.guestPoints !== null;
          const isHostWinner =
            hasPlayed && game.hostPoints! > game.guestPoints!;
          const isGuestWinner =
            hasPlayed && game.guestPoints! > game.hostPoints!;

          return (
            <div
              key={game.host + game.guest}
              className="border border-border rounded-xl p-4 bg-card shadow-sm flex flex-col gap-3"
            >
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-sm font-medium">{dateStr}</span>
                <span className="text-xs text-muted-foreground">
                  {timeOnly}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm ${isCoburgHome ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
                  >
                    {game.host}
                  </span>
                  <span
                    className={`text-base font-bold ${isHostWinner ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {hasPlayed ? game.hostPoints : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm ${isCoburgAway ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
                  >
                    {game.guest}
                  </span>
                  <span
                    className={`text-base font-bold ${isGuestWinner ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {hasPlayed ? game.guestPoints : '-'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableCaption className="mb-4">
            Alle neuesten Entwicklungen
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-30">Spielzeit</TableHead>
              <TableHead className="text-right">Heimteam</TableHead>
              <TableHead className="w-25 text-center">Ergebnis</TableHead>
              <TableHead className="text-left">Gastteam</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => {
              const dateObj = new Date(game.date);
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

              const isCoburgHome = game.host === 'HSC 2000 Coburg';
              const isCoburgAway = game.guest === 'HSC 2000 Coburg';

              const hasPlayed =
                game.hostPoints !== null && game.guestPoints !== null;

              return (
                <TableRow key={game.host + game.guest}>
                  <TableCell className="whitespace-nowrap py-3">
                    <div className="text-sm font-medium">{dateStr}</div>
                    <div className="text-xs text-muted-foreground">
                      {timeOnly}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`text-right py-3 ${
                      isCoburgHome
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {game.host}
                  </TableCell>
                  <TableCell className="text-center font-bold tracking-wider py-3 px-2">
                    {hasPlayed
                      ? `${game.hostPoints} : ${game.guestPoints}`
                      : '- : -'}
                  </TableCell>
                  <TableCell
                    className={`text-left py-3 ${
                      isCoburgAway
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {game.guest}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
