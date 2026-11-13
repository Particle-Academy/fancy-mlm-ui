import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ReferralStats } from "./ReferralStats";
import type { ReferralStatRow } from "./types";

/*
 * No DOM library in this repo, so these render on the server and read the
 * markup. Interaction (switching group, picking a row) is checked in a real
 * headless browser, not here.
 */
const rows: ReferralStatRow[] = [
  { key: "x", scans: 4, uniqueSessions: 3, signups: 2, conversionRate: 2 / 3 },
  { key: "y", label: "Second scope", scans: 2, uniqueSessions: 2, signups: 0, conversionRate: 0 },
];

const html = (el: React.ReactElement) => renderToStaticMarkup(el);

describe("ReferralStats", () => {
  it("exposes its controlled state as stable handles", () => {
    const out = html(<ReferralStats rows={rows} groupBy="scope" metric="scans" range={{ from: "2026-11-01", to: "2026-11-05" }} />);

    expect(out).toContain('data-fancy-mlm="referral-stats"');
    expect(out).toContain('data-mlm-group-by="scope"');
    expect(out).toContain('data-mlm-metric="scans"');
    expect(out).toContain('data-mlm-range-from="2026-11-01"');
    expect(out).toContain('data-mlm-range-to="2026-11-05"');
  });

  it("gives every row and every cell a handle keyed by the row key", () => {
    const out = html(<ReferralStats rows={rows} />);

    for (const key of ["x", "y"]) {
      expect(out).toContain(`data-mlm-stat-key="${key}"`);
    }
    expect(out).toContain('data-mlm-stat="uniqueSessions"');
    expect(out).toContain('data-mlm-stat="conversionRate"');
    expect(out).toContain("66.7%");
    expect(out).toContain("Second scope");
  });

  it("marks the selected row", () => {
    const out = html(<ReferralStats rows={rows} selectedKey="y" />);

    expect(out).toContain('data-mlm-selected-key="y"');
    expect(out.split('data-mlm-selected="true"')).toHaveLength(2); // exactly one row
    expect(out).toContain('data-mlm-stat-key="y" data-mlm-stat="key" data-mlm-selected="true"');
  });

  it("renders the totals row inside the table, not after it", () => {
    // A raw <tfoot> handed to react-fancy's Table lands OUTSIDE its <table>
    // (Table only places Head and Body inside), so React logged a DOM-nesting
    // error and the totals were not part of the table at all (lab run 601, K34).
    const out = html(<ReferralStats rows={rows} />);
    const tableEnd = out.lastIndexOf("</table>");

    expect(tableEnd).toBeGreaterThan(-1);
    expect(out.indexOf('data-mlm-total="scans"')).toBeLessThan(tableEnd);
    expect(out.slice(tableEnd)).not.toContain("<tr");
    expect(out.slice(tableEnd)).not.toContain("<tfoot");
  });

  it("totals scans and signups, and leaves sessions and rate blank unless the host supplies totals", () => {
    const out = html(<ReferralStats rows={rows} />);
    expect(out).toContain('data-mlm-total="scans">6<');
    expect(out).toContain('data-mlm-total="signups">2<');
    expect(out).toContain('data-mlm-total="uniqueSessions">—<');

    const withTotals = html(<ReferralStats rows={rows} totals={{ scans: 6, uniqueSessions: 4, signups: 2, conversionRate: 0.5 }} />);
    expect(withTotals).toContain('data-mlm-total="uniqueSessions">4<');
    expect(withTotals).toContain('data-mlm-total="conversionRate">50.0%<');
  });

  it("hides the switches the host did not wire, so nothing looks interactive that is not", () => {
    expect(html(<ReferralStats rows={rows} />)).not.toContain('data-mlm-control="group-by"');
    expect(html(<ReferralStats rows={rows} onGroupByChange={() => {}} />)).toContain('data-mlm-control="group-by"');
    expect(html(<ReferralStats rows={rows} onMetricChange={() => {}} />)).toContain('data-mlm-control="metric"');
    expect(html(<ReferralStats rows={rows} onRangeChange={() => {}} />)).toContain('data-mlm-control="range"');
  });

  it("shows an empty state for no rows", () => {
    const out = html(<ReferralStats rows={[]} emptyLabel="Nothing yet" />);
    expect(out).toContain("Nothing yet");
    expect(out).toContain('data-mlm-empty="true"');
  });
});
