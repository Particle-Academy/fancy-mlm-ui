/** A network member as the UI consumes it — JSON-friendly, agent-emittable. */
export interface DownlineMember {
  id: string;
  sponsorId?: string | null;
  label?: string;
  tier?: string;
  active?: boolean;
  meta?: Record<string, unknown>;
}

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
