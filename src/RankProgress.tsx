import { cn, Badge } from "@particle-academy/react-fancy";

export interface RankProgressProps {
  /** Current tier/rank key. */
  tier: string;
  /** The next tier (omit / null at the top tier). */
  nextTier?: string | null;
  /** Progress toward the next tier (e.g. team volume, active referrals). */
  value: number;
  /** Threshold that unlocks `nextTier`. */
  target?: number | null;
  unit?: string;
  className?: string;
}

/** Current rank + a progress bar toward the next tier's qualification threshold. */
export function RankProgress({ tier, nextTier, value, target, unit, className }: RankProgressProps) {
  const hasTarget = typeof target === "number" && target > 0 && nextTier != null;
  const pct = hasTarget ? Math.max(0, Math.min(100, (value / target) * 100)) : 100;
  const remaining = hasTarget ? Math.max(0, target - value) : 0;
  const suffix = unit ? ` ${unit}` : "";

  return (
    <div data-fancy-mlm="rank-progress" className={cn("fancy-mlm-rank", className)}>
      <div className="fancy-mlm-rank__head">
        <Badge variant="soft">{tier}</Badge>
        {hasTarget ? (
          <span className="fancy-mlm-rank__next">→ {nextTier}</span>
        ) : (
          <span className="fancy-mlm-rank__muted">Top tier</span>
        )}
      </div>

      <div
        className="fancy-mlm-rank__bar"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        data-mlm-rank-pct={Math.round(pct)}
      >
        <div className="fancy-mlm-rank__fill" style={{ width: `${pct}%` }} />
      </div>

      {hasTarget ? (
        <div className="fancy-mlm-rank__meta">
          {value.toLocaleString()} / {target.toLocaleString()}
          {suffix} · {remaining.toLocaleString()} to {nextTier}
        </div>
      ) : null}
    </div>
  );
}
