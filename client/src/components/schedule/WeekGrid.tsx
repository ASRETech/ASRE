import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS_PER_DAY = 48; // 30-min slots

function slotToTime(slot: number): string {
  const h = Math.floor(slot / 2);
  const m = slot % 2 === 0 ? "00" : "30";
  const ampm = h < 12 ? "am" : "pm";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${m}${ampm}`;
}

interface WeekGridProps {
  grid: string[][];
  bucketColors: Record<string, string>;
  activeBucket: string;
  onChange: (grid: string[][]) => void;
}

export function WeekGrid({ grid, bucketColors, activeBucket, onChange }: WeekGridProps) {
  const isPainting = useRef(false);
  const paintValue = useRef<string>("");

  // LOW-01: Listen for mouseup/touchend on window to prevent stuck painting state
  // when user releases mouse outside the grid
  useEffect(() => {
    const stopPainting = () => { isPainting.current = false; };
    window.addEventListener("mouseup", stopPainting);
    window.addEventListener("touchend", stopPainting);
    return () => {
      window.removeEventListener("mouseup", stopPainting);
      window.removeEventListener("touchend", stopPainting);
    };
  }, []);

  const handleCellMouseDown = useCallback((dayIdx: number, slotIdx: number) => {
    isPainting.current = true;
    const current = grid[dayIdx]?.[slotIdx] ?? "";
    // Toggle: if cell already has this bucket, clear it; otherwise paint it
    paintValue.current = current === activeBucket ? "" : activeBucket;
    const newGrid = grid.map(row => [...row]);
    newGrid[dayIdx][slotIdx] = paintValue.current;
    onChange(newGrid);
  }, [grid, activeBucket, onChange]);

  const handleCellMouseEnter = useCallback((dayIdx: number, slotIdx: number) => {
    if (!isPainting.current) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[dayIdx][slotIdx] = paintValue.current;
    onChange(newGrid);
  }, [grid, onChange]);

  // HIGH-06: Touch event handlers for mobile painting
  const handleTouchStart = useCallback((dayIdx: number, slotIdx: number, e: React.TouchEvent) => {
    e.preventDefault(); // prevent scroll while painting
    isPainting.current = true;
    const current = grid[dayIdx]?.[slotIdx] ?? "";
    paintValue.current = current === activeBucket ? "" : activeBucket;
    const newGrid = grid.map(row => [...row]);
    newGrid[dayIdx][slotIdx] = paintValue.current;
    onChange(newGrid);
  }, [grid, activeBucket, onChange]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPainting.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
    if (!el) return;
    const dayIdx = parseInt(el.dataset.day ?? "-1");
    const slotIdx = parseInt(el.dataset.slot ?? "-1");
    if (dayIdx < 0 || slotIdx < 0) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[dayIdx][slotIdx] = paintValue.current;
    onChange(newGrid);
  }, [grid, onChange]);

  // Hour labels (every 2 slots = 1 hour)
  const hourLabels = Array.from({ length: 24 }, (_, i) => {
    const ampm = i < 12 ? "am" : "pm";
    const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
    return `${hour}${ampm}`;
  });

  return (
    <div
      className="overflow-auto select-none touch-none"
      onTouchMove={handleTouchMove}
    >
      <div className="min-w-[640px]">
        {/* Day headers */}
        <div className="flex">
          <div className="w-12 flex-shrink-0" />
          {DAYS.map(day => (
            <div key={day} className="flex-1 text-center text-xs font-medium text-slate-400 py-1 border-b border-slate-700">
              {day}
            </div>
          ))}
        </div>

        {/* Grid rows — one per 30-min slot */}
        <div className="relative">
          {Array.from({ length: SLOTS_PER_DAY }, (_, slotIdx) => (
            <div key={slotIdx} className="flex" style={{ height: "14px" }}>
              {/* Time label — only on hour boundaries */}
              <div className="w-12 flex-shrink-0 flex items-center justify-end pr-1.5">
                {slotIdx % 2 === 0 && (
                  <span className="text-[9px] text-slate-600 leading-none">
                    {hourLabels[slotIdx / 2]}
                  </span>
                )}
              </div>
              {DAYS.map((_, dayIdx) => {
                const bucket = grid[dayIdx]?.[slotIdx] ?? "";
                const color = bucket ? (bucketColors[bucket] ?? "#475569") : undefined;
                return (
                  <div
                    key={dayIdx}
                    data-day={dayIdx}
                    data-slot={slotIdx}
                    className={cn(
                      "flex-1 border-r border-slate-800/50 cursor-crosshair transition-colors",
                      slotIdx % 2 === 0 ? "border-t border-t-slate-700/40" : "",
                      !bucket && "hover:bg-slate-700/30"
                    )}
                    style={color ? { backgroundColor: color, opacity: 0.85 } : undefined}
                    onMouseDown={() => handleCellMouseDown(dayIdx, slotIdx)}
                    onMouseEnter={() => handleCellMouseEnter(dayIdx, slotIdx)}
                    onTouchStart={(e) => handleTouchStart(dayIdx, slotIdx, e)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
