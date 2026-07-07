import { CircleX, Trash } from 'lucide-react';

export default function Tip() {
  return (
    <div className="flex flex-col gap-2 border border-muted-200 rounded-lg p-4 relative">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between">
        <div className="flex flex-row items-baseline sm:gap-3 gap-2 text-lg font-bold">
          <span className="text-sm sm:text-base font-bold">
            HSC 2000 Coburg
          </span>
          <span className="text-sm sm:text-base font-bold">27</span>
          <span className="text-sm sm:text-base font-bold">:</span>
          <span className="text-sm sm:text-base font-bold">27</span>
          <span className="text-sm sm:text-base font-bold">Erlangen</span>
        </div>
        <span className="text-sm text-muted-foreground">
          12.12.2023, 18:00 Uhr
        </span>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <CircleX size={18} className="text-destructive shrink-0" />
        <p className="text-sm">Dein Tipp: HSC 2000 Coburg 27 : 27 Erlangen</p>
      </div>
    </div>
  );
}
