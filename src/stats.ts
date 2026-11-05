import type { ReferralStatRow, ReferralStatsMetric } from "./types";

/** Bar data for one metric; conversion is plotted as a percentage. */
export function statsChartData(rows: ReferralStatRow[], metric: ReferralStatsMetric): Array<{ label: string; value: number }> {
  return rows.map((row) => ({
    label: row.label ?? row.key,
    value: metric === "conversionRate" ? Math.round(row.conversionRate * 1000) / 10 : row[metric],
  }));
}

/**
 * Totals that can honestly be summed. Unique sessions cannot: a visitor who
 * scanned two codes is one session in each row. Ask the engine for an
 * ungrouped figure and pass it as `totals` instead.
 */
export function summarizeStats(rows: ReferralStatRow[]): { scans: number; signups: number } {
  return rows.reduce((sum, row) => ({ scans: sum.scans + row.scans, signups: sum.signups + row.signups }), { scans: 0, signups: 0 });
}

/** A rate as a percentage with one decimal: 0.6667 -> "66.7%". */
export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
