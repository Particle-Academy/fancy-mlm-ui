import type { DownlineEdge, DownlineMember } from "./types";

export interface DownlineNode<T extends DownlineMember = DownlineMember> {
  member: T;
  depth: number;
  children: DownlineNode<T>[];
}

/** The parent pointer an edge follows — sponsor tree vs placement tree (with fallback). */
function parentOf(member: DownlineMember, edge: DownlineEdge): string | null {
  if (edge === "placement") {
    return member.placementId ?? member.sponsorId ?? null;
  }
  return member.sponsorId ?? null;
}

/**
 * Build a downline forest from a flat member list. By default members are linked
 * by `sponsorId` (unilevel, the enroller tree); pass `edge: "placement"` to link
 * by `placementId` (binary / matrix, the placement tree, falling back to
 * `sponsorId`) — the same list renders every tree shape. When `rootId` is given,
 * returns just that member's subtree. Members whose parent isn't in the list
 * become roots; cyclic references are broken (each member appears at most once).
 */
export function buildDownline<T extends DownlineMember>(
  members: T[],
  rootId?: string | null,
  edge: DownlineEdge = "sponsor",
): DownlineNode<T>[] {
  const byId = new Map<string, T>();
  for (const member of members) {
    byId.set(member.id, member);
  }

  const childrenOf = new Map<string, T[]>();
  for (const member of members) {
    const parentId = parentOf(member, edge);
    if (parentId !== null && byId.has(parentId)) {
      const bucket = childrenOf.get(parentId);
      if (bucket) {
        bucket.push(member);
      } else {
        childrenOf.set(parentId, [member]);
      }
    }
  }

  const seen = new Set<string>();
  const build = (member: T, depth: number): DownlineNode<T> => {
    seen.add(member.id);
    const children = (childrenOf.get(member.id) ?? [])
      .filter((child) => !seen.has(child.id))
      .map((child) => build(child, depth + 1));
    return { member, depth, children };
  };

  if (rootId != null) {
    const root = byId.get(rootId);
    return root ? [build(root, 0)] : [];
  }

  const roots = members.filter((member) => {
    const parentId = parentOf(member, edge);
    return parentId === null || !byId.has(parentId);
  });

  return roots.filter((root) => !seen.has(root.id)).map((root) => build(root, 0));
}
