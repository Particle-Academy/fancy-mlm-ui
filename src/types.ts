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
