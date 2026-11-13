import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RankProgress } from "./RankProgress";

const bar = (html: string) => /<div[^>]*role="progressbar"[^>]*>/.exec(html)?.[0] ?? "";

/*
 * axe aria-progressbar-name (lab run 601, K34): the bar carried a value and no
 * name, so a screen reader announced "70 percent" of nothing.
 */
describe("RankProgress", () => {
  it("names the progressbar after the tier it leads to", () => {
    const el = bar(renderToStaticMarkup(<RankProgress tier="Silver" nextTier="Gold" value={700} target={1000} unit="PV" />));

    expect(el).toContain('aria-label="Progress to Gold"');
    expect(el).toContain(`aria-valuetext="700 of ${(1000).toLocaleString()} PV"`);
  });

  it("still names the bar at the top tier", () => {
    const el = bar(renderToStaticMarkup(<RankProgress tier="Diamond" value={5000} />));

    expect(el).toMatch(/aria-label="[^"]+"/);
    expect(el).toContain('aria-label="Diamond: top tier"');
  });
});
