import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const matchesF = [
  {
    home: 'HSC 2000 Coburg',
    away: 'VfL Eintracht Hagen',
    homeGoals: 29,
    awayGoals: 27,
    time: '05.09.2026, 19:30 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'Dessau-Roßlauer HV',
    homeGoals: 31,
    awayGoals: 28,
    time: '19.09.2026, 19:30 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'HBW Balingen-Weilstetten',
    homeGoals: 26,
    awayGoals: 29,
    time: '03.10.2026, 19:30 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'HC Elbflorenz Dresden',
    homeGoals: 33,
    awayGoals: 30,
    time: '17.10.2026, 19:30 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'TuS N-Lübbecke',
    homeGoals: 28,
    awayGoals: 28,
    time: '31.10.2026, 19:30 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'TV 05/07 Hüttenberg',
    homeGoals: 30,
    awayGoals: 25,
    time: '14.11.2026, 19:30 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'Eulen Ludwigshafen',
    homeGoals: 34,
    awayGoals: 31,
    time: '27.11.2026, 20:00 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'TUSEM Essen',
    homeGoals: 27,
    awayGoals: 24,
    time: '13.12.2026, 17:00 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'TSV Bayer Dormagen',
    homeGoals: 32,
    awayGoals: 29,
    time: '26.12.2026, 16:00 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'TV Großwallstadt',
    homeGoals: 31,
    awayGoals: 31,
    time: '06.02.2027, 19:30 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'ASV Hamm-Westfalen',
    homeGoals: 25,
    awayGoals: 28,
    time: '20.02.2027, 19:30 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'VfL Lübeck-Schwartau',
    homeGoals: 29,
    awayGoals: 26,
    time: '06.03.2027, 19:30 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'HSG Nordhorn-Lingen',
    homeGoals: 35,
    awayGoals: 32,
    time: '20.03.2027, 19:30 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'TuS Ferndorf',
    homeGoals: 30,
    awayGoals: 24,
    time: '04.04.2027, 17:00 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'Bergischer HC',
    homeGoals: 24,
    awayGoals: 28,
    time: '24.04.2027, 19:30 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'GWD Minden',
    homeGoals: 28,
    awayGoals: 26,
    time: '14.05.2027, 20:00 Uhr',
  },
  {
    home: 'HSC 2000 Coburg',
    away: 'Eintracht Hildesheim',
    homeGoals: 36,
    awayGoals: 30,
    time: '05.06.2027, 18:00 Uhr',
  },
  {
    home: 'HC Elbflorenz Dresden',
    away: 'HSC 2000 Coburg',
    homeGoals: 29,
    awayGoals: 29,
    time: '13.09.2026, 17:00 Uhr',
  },
  {
    home: 'VfL Eintracht Hagen',
    away: 'HSC 2000 Coburg',
    homeGoals: 32,
    awayGoals: 30,
    time: '25.09.2026, 20:00 Uhr',
  },
  {
    home: 'Dessau-Roßlauer HV',
    away: 'HSC 2000 Coburg',
    homeGoals: 27,
    awayGoals: 29,
    time: '11.10.2026, 17:00 Uhr',
  },
  {
    home: 'HBW Balingen-Weilstetten',
    away: 'HSC 2000 Coburg',
    homeGoals: 31,
    awayGoals: 26,
    time: '23.10.2026, 19:30 Uhr',
  },
  {
    home: 'TV 05/07 Hüttenberg',
    away: 'HSC 2000 Coburg',
    homeGoals: 28,
    awayGoals: 32,
    time: '08.11.2026, 17:00 Uhr',
  },
  {
    home: 'TuS N-Lübbecke',
    away: 'HSC 2000 Coburg',
    homeGoals: 26,
    awayGoals: 25,
    time: '21.11.2026, 19:00 Uhr',
  },
  {
    home: 'TUSEM Essen',
    away: 'HSC 2000 Coburg',
    homeGoals: 25,
    awayGoals: 28,
    time: '04.12.2026, 19:30 Uhr',
  },
  {
    home: 'Eulen Ludwigshafen',
    away: 'HSC 2000 Coburg',
    homeGoals: 30,
    awayGoals: 30,
    time: '19.12.2026, 19:00 Uhr',
  },
  {
    home: 'TV Großwallstadt',
    away: 'HSC 2000 Coburg',
    homeGoals: 28,
    awayGoals: 29,
    time: '30.12.2026, 19:30 Uhr',
  },
  {
    home: 'TSV Bayer Dormagen',
    away: 'HSC 2000 Coburg',
    homeGoals: 31,
    awayGoals: 34,
    time: '14.02.2027, 17:00 Uhr',
  },
  {
    home: 'VfL Lübeck-Schwartau',
    away: 'HSC 2000 Coburg',
    homeGoals: 27,
    awayGoals: 27,
    time: '28.02.2027, 17:00 Uhr',
  },
  {
    home: 'ASV Hamm-Westfalen',
    away: 'HSC 2000 Coburg',
    homeGoals: 30,
    awayGoals: 26,
    time: '12.03.2027, 19:30 Uhr',
  },
  {
    home: 'TuS Ferndorf',
    away: 'HSC 2000 Coburg',
    homeGoals: 24,
    awayGoals: 28,
    time: '27.03.2027, 19:30 Uhr',
  },
  {
    home: 'HSG Nordhorn-Lingen',
    away: 'HSC 2000 Coburg',
    homeGoals: 33,
    awayGoals: 31,
    time: '18.04.2027, 17:00 Uhr',
  },
  {
    home: 'GWD Minden',
    away: 'HSC 2000 Coburg',
    homeGoals: 29,
    awayGoals: 30,
    time: '02.05.2027, 17:00 Uhr',
  },
  {
    home: 'Bergischer HC',
    away: 'HSC 2000 Coburg',
    homeGoals: 32,
    awayGoals: 27,
    time: '22.05.2027, 19:00 Uhr',
  },
  {
    home: 'Eintracht Hildesheim',
    away: 'HSC 2000 Coburg',
    homeGoals: 28,
    awayGoals: 33,
    time: '30.05.2027, 17:00 Uhr',
  },
];

export function SeasonTable() {
  return (
    <div className="w-full">
      <h3 className="text-md font-semibold mb-4 md:hidden px-1">
        Alle neuesten Entwicklungen aus der Saison 2026/27
      </h3>
      <div className="flex flex-col gap-3 md:hidden">
        {matchesF.map((match) => {
          const [date, timeOnly] = match.time.split(', ');
          const isCoburgHome = match.home === 'HSC 2000 Coburg';
          const isCoburgAway = match.away === 'HSC 2000 Coburg';

          return (
            <div
              key={match.home + match.away}
              className="border border-border rounded-xl p-4 bg-card shadow-sm flex flex-col gap-3"
            >
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-sm font-medium">{date}</span>
                <span className="text-xs text-muted-foreground">
                  {timeOnly}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm ${isCoburgHome ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
                  >
                    {match.home}
                  </span>
                  <span
                    className={`text-base font-bold ${match.homeGoals > match.awayGoals ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {match.homeGoals}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm ${isCoburgAway ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
                  >
                    {match.away}
                  </span>
                  <span
                    className={`text-base font-bold ${match.awayGoals > match.homeGoals ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {match.awayGoals}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border shadow-sm">
        <Table>
          <TableCaption className="mb-4">
            Alle neuesten Entwicklungen aus der Saison 2026/27
          </TableCaption>
          <TableHeader className="bg-huk-accent">
            <TableRow>
              <TableHead className="w-[120px] text-black">Spielzeit</TableHead>
              <TableHead className="text-right text-black">Heimteam</TableHead>
              <TableHead className="w-[100px] text-center text-black">
                Ergebnis
              </TableHead>
              <TableHead className="text-left text-black">Gastteam</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matchesF.map((match) => {
              const [date, timeOnly] = match.time.split(', ');
              const isCoburgHome = match.home === 'HSC 2000 Coburg';
              const isCoburgAway = match.away === 'HSC 2000 Coburg';

              return (
                <TableRow
                  key={match.home + match.away}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="whitespace-nowrap py-3">
                    <div className="text-sm font-medium">{date}</div>
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
                    {match.home}
                  </TableCell>
                  <TableCell className="text-center font-bold tracking-wider py-3 px-2">
                    {match.homeGoals} : {match.awayGoals}
                  </TableCell>
                  <TableCell
                    className={`text-left py-3 ${
                      isCoburgAway
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {match.away}
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
