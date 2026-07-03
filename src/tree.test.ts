import { describe, it, expect } from "vitest";
import { buildDownline } from "./tree";
import type { DownlineMember } from "./types";

const members: DownlineMember[] = [
  { id: "root" },
  { id: "a", sponsorId: "root" },
  { id: "b", sponsorId: "root" },
  { id: "a1", sponsorId: "a" },
];

describe("buildDownline", () => {
  it("builds a forest from a flat list", () => {
    const forest = buildDownline(members);

    expect(forest).toHaveLength(1);
    expect(forest[0]!.member.id).toBe("root");
    expect(forest[0]!.children.map((c) => c.member.id)).toEqual(["a", "b"]);
    expect(forest[0]!.children[0]!.children[0]!.member.id).toBe("a1");
    expect(forest[0]!.children[0]!.children[0]!.depth).toBe(2);
  });

  it("returns just a subtree for rootId", () => {
    const forest = buildDownline(members, "a");

    expect(forest).toHaveLength(1);
    expect(forest[0]!.member.id).toBe("a");
    expect(forest[0]!.children.map((c) => c.member.id)).toEqual(["a1"]);
  });

  it("treats members with an out-of-list sponsor as roots", () => {
    const forest = buildDownline([{ id: "x", sponsorId: "missing" }, { id: "y", sponsorId: "x" }]);

    expect(forest.map((n) => n.member.id)).toEqual(["x"]);
    expect(forest[0]!.children.map((c) => c.member.id)).toEqual(["y"]);
  });

  it("breaks cyclic references without infinite recursion", () => {
    const forest = buildDownline([
      { id: "a", sponsorId: "b" },
      { id: "b", sponsorId: "a" },
    ]);

    // both have an in-list sponsor, so neither is a natural root -> empty forest, no hang
    expect(Array.isArray(forest)).toBe(true);
  });

  it("links by the placement pointer for binary / matrix trees", () => {
    // Same list, two shapes: origin is SPONSORED by root but PLACED under a.
    const placed: DownlineMember[] = [
      { id: "root" },
      { id: "a", sponsorId: "root", placementId: "root" },
      { id: "origin", sponsorId: "root", placementId: "a" },
    ];

    const sponsorTree = buildDownline(placed, "root", "sponsor");
    expect(sponsorTree[0]!.children.map((c) => c.member.id)).toEqual(["a", "origin"]);

    const placementTree = buildDownline(placed, "root", "placement");
    // origin now hangs under a (its placement), not directly under root
    expect(placementTree[0]!.children.map((c) => c.member.id)).toEqual(["a"]);
    expect(placementTree[0]!.children[0]!.children.map((c) => c.member.id)).toEqual(["origin"]);
  });

  it("falls back to the sponsor pointer when placement is unset", () => {
    const forest = buildDownline(members, "root", "placement");
    // no placementId anywhere -> identical to the sponsor tree
    expect(forest[0]!.children.map((c) => c.member.id)).toEqual(["a", "b"]);
  });
});
