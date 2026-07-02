import { CircleX } from 'lucide-react';

export default function Tip() {
  return (
    <div className="flex flex-col gap-2 border border-muted-200 rounded-lg p-4">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between">
        <div className="flex flex-row items-baseline sm:gap-3 gap-2 text-lg font-bold">
          <span className="text-sm sm:text-base font-bold">
            HSC 2000 Coburg
          </span>
          <span className="text-sm sm:text-base font-bold">0</span>
          <span className="text-sm sm:text-base font-bold">:</span>
          <span className="text-sm sm:text-base font-bold">1</span>
          <span className="text-sm sm:text-base font-bold">Erlangen</span>
        </div>
        <span className="text-sm text-muted-foreground">
          12.12.2023, 18:00 Uhr
        </span>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <CircleX size={18} className="text-destructive shrink-0" />
        <p className="sm:text-base text-sm">
          Du hast getippt, dass HSC 2000 Coburg gegen Erlangen mit 0:1 verliert.
        </p>
      </div>
    </div>
  );
}
