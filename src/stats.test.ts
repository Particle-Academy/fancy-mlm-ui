import { describe, it, expect } from "vitest";
import { formatRate, statsChartData, summarizeStats } from "./stats";
import type { ReferralStatRow } from "./types";

const rows: ReferralStatRow[] = [
  { key: "aaaaaaaaaaaaaaaa", label: "Poster", scans: 3, uniqueSessions: 2, signups: 1, conversionRate: 0.5 },
  { key: "bbbbbbbbbbbbbbbb", scans: 2, uniqueSessions: 2, signups: 0, conversionRate: 0 },
  { key: "cccccccccccccccc", scans: 1, uniqueSessions: 1, signups: 1, conversionRate: 1 },
];

describe("statsChartData", () => {
  it("charts the chosen metric, labelled by label then key", () => {
    expect(statsChartData(rows, "scans")).toEqual([
      { label: "Poster", value: 3 },
      { label: "bbbbbbbbbbbbbbbb", value: 2 },
      { label: "cccccccccccccccc", value: 1 },
    ]);
  });

  it("charts conversion as a percentage", () => {
    expect(statsChartData(rows, "conversionRate").map((d) => d.value)).toEqual([50, 0, 100]);
  });
});

describe("summarizeStats", () => {
  it("sums scans and signups but never unique sessions, which overlap across keys", () => {
    expect(summarizeStats(rows)).toEqual({ scans: 6, signups: 2 });
  });

  it("is zero for no rows", () => {
    expect(summarizeStats([])).toEqual({ scans: 0, signups: 0 });
  });
});

describe("formatRate", () => {
  it("renders a rate as a percentage with one decimal", () => {
    expect(formatRate(0.6666666666666666)).toBe("66.7%");
    expect(formatRate(0)).toBe("0.0%");
    expect(formatRate(1.5)).toBe("150.0%");
  });
});
