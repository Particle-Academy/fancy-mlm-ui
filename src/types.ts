/** A network member as the UI consumes it — JSON-friendly, agent-emittable. */
export interface DownlineMember {
  id: string;
  /** Enroller pointer — the edge a unilevel tree draws by. */
  sponsorId?: string | null;
  /** Placement pointer — the edge binary / matrix trees draw by (falls back to `sponsorId`). */
  placementId?: string | null;
  label?: string;
  tier?: string;
  active?: boolean;
  meta?: Record<string, unknown>;
}

/**
 * Which parent pointer links the tree — `"sponsor"` (unilevel, the enroller tree)
 * or `"placement"` (binary / matrix, the placement tree, falling back to
 * `sponsorId`). Mirrors the engine's tree types.
 */
export type DownlineEdge = "sponsor" | "placement";

export type CommissionStatus = "pending" | "paid" | "held" | "reversed";

/** What referral stats are grouped by. Mirrors the engines' `stats(groupBy)`. */
export type ReferralStatsGroupBy = "code" | "scope" | "member";

/** Which figure the chart plots. */
export type ReferralStatsMetric = "scans" | "uniqueSessions" | "signups" | "conversionRate";

/**
 * One row of referral stats: the engines' `StatRow` (PHP `toArray()`, or the
 * Node object as-is), plus an optional display `label`. JSON-friendly.
 */
export interface ReferralStatRow {
  /** The code, scope key or member id the row is for. Also its stable handle. */
  key: string;
  label?: string;
  scans: number;
  /** Distinct hashed sessions. Never summed across rows: one visitor can scan many codes. */
  uniqueSessions: number;
  signups: number;
  /** signups / uniqueSessions; 0 with no sessions; can exceed 1. */
  conversionRate: number;
}

/** A date range as `YYYY-MM-DD` strings, `from` inclusive, `to` exclusive. */
export interface ReferralStatsRange {
  from: string;
  to: string;
}

/** One row of a commission statement — mirrors the engine's RewardComputation. */
export interface CommissionRow {
  id?: string;
  recipientMemberId?: string;
  recipientLabel?: string;
  level: number;
  metric?: string;
  tier?: string;
  amount: number;
  status?: CommissionStatus;
}
