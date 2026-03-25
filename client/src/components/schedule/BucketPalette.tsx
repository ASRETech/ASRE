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
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Time Blocks</p>
      {buckets.map(bucket => (
        <button
          key={bucket.key}
          onClick={() => onSelect(bucket.key)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all",
            activeBucket === bucket.key
              ? "bg-muted ring-1 ring-foreground/20"
              : "hover:bg-muted/80"
          )}
        >
          <div
            className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
            style={{ backgroundColor: bucket.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground truncate">{bucket.label}</span>
              {bucket.shortcut && (
                <span className="text-[10px] text-muted-foreground/70 bg-muted px-1 rounded ml-1 flex-shrink-0">
                  {bucket.shortcut}
                </span>
              )}
            </div>
            {bucket.description && (
              <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{bucket.description}</p>
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
            ? "bg-muted ring-1 ring-foreground/20"
            : "hover:bg-muted/80"
        )}
      >
        <div className="w-3.5 h-3.5 rounded-sm flex-shrink-0 border border-border bg-transparent" />
        <span className="text-sm text-muted-foreground">Eraser</span>
        {activeBucket === "" && (
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 ml-auto" />
        )}
      </button>
    </div>
  );
}
