import type { DownlineMember } from "./types";

export interface DownlineNode<T extends DownlineMember = DownlineMember> {
  member: T;
  depth: number;
  children: DownlineNode<T>[];
}

/**
 * Build a downline forest from a flat member list, linked by `sponsorId`. When
 * `rootId` is given, returns just that member's subtree. Members whose sponsor
 * isn't in the list become roots; cyclic references are broken (each member
 * appears at most once).
 */
export function buildDownline<T extends DownlineMember>(
  members: T[],
  rootId?: string | null,
): DownlineNode<T>[] {
  const byId = new Map<string, T>();
  for (const member of members) {
    byId.set(member.id, member);
  }

  const childrenOf = new Map<string, T[]>();
  for (const member of members) {
    const sponsorId = member.sponsorId ?? null;
    if (sponsorId !== null && byId.has(sponsorId)) {
      const bucket = childrenOf.get(sponsorId);
      if (bucket) {
        bucket.push(member);
      } else {
        childrenOf.set(sponsorId, [member]);
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
    const sponsorId = member.sponsorId ?? null;
    return sponsorId === null || !byId.has(sponsorId);
  });

  return roots.filter((root) => !seen.has(root.id)).map((root) => build(root, 0));
}
