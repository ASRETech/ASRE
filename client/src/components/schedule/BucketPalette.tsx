import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface Bucket {
  key: string;
  label: string;
  color: string;
  shortcut?: string;
  description?: string;
}

interface BucketPaletteProps {
  buckets: Bucket[];
  activeBucket: string;
  onSelect: (key: string) => void;
}

export function BucketPalette({ buckets, activeBucket, onSelect }: BucketPaletteProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Time Blocks</p>
      {buckets.map(bucket => (
        <button
          key={bucket.key}
          onClick={() => onSelect(bucket.key)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all",
            activeBucket === bucket.key
              ? "bg-slate-700 ring-1 ring-white/20"
              : "hover:bg-slate-800"
          )}
        >
          <div
            className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
            style={{ backgroundColor: bucket.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-200 truncate">{bucket.label}</span>
              {bucket.shortcut && (
                <span className="text-[10px] text-slate-500 bg-slate-700 px-1 rounded ml-1 flex-shrink-0">
                  {bucket.shortcut}
                </span>
              )}
            </div>
            {bucket.description && (
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{bucket.description}</p>
            )}
          </div>
          {activeBucket === bucket.key && (
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          )}
        </button>
      ))}

      {/* Eraser */}
      <button
        onClick={() => onSelect("")}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all mt-2",
          activeBucket === ""
            ? "bg-slate-700 ring-1 ring-white/20"
            : "hover:bg-slate-800"
        )}
      >
        <div className="w-3.5 h-3.5 rounded-sm flex-shrink-0 border border-slate-500 bg-transparent" />
        <span className="text-sm text-slate-400">Eraser</span>
        {activeBucket === "" && (
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 ml-auto" />
        )}
      </button>
    </div>
  );
}
