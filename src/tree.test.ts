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
});
