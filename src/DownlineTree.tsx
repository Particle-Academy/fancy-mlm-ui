import { useState, type ComponentProps, type ReactNode } from "react";
import { cn, Badge } from "@particle-academy/react-fancy";
import type { DownlineEdge, DownlineMember } from "./types";
import { buildDownline, type DownlineNode } from "./tree";

type BadgeColor = ComponentProps<typeof Badge>["color"];

export interface DownlineTreeProps<T extends DownlineMember = DownlineMember> {
  /** Flat member list (controlled). Linked into a tree by `edge`. */
  value: T[];
  /**
   * Which pointer links the tree — `"sponsor"` (unilevel, default) or
   * `"placement"` (binary / matrix). The same `value` renders every tree shape.
   */
  edge?: DownlineEdge;
  /** Render only this member's subtree. */
  rootId?: string | null;
  /** Highlight a member (controlled selection). */
  selectedId?: string | null;
  onSelect?: (id: string, member: T) => void;
  /** Map a tier to a react-fancy Badge color. */
  tierColor?: (tier: string | undefined) => BadgeColor;
  /** Replace the default member row content. */
  renderMember?: (member: T, node: DownlineNode<T>) => ReactNode;
  className?: string;
}

/**
 * Genealogy / downline tree. Controlled `value`, stable `data-mlm-node` handles
 * on every member, controlled selection, and JSON-friendly inputs — an agent can
 * read the tree and drive selection without scraping the DOM.
 */
export function DownlineTree<T extends DownlineMember = DownlineMember>({
  value,
  edge = "sponsor",
  rootId,
  selectedId,
  onSelect,
  tierColor,
  renderMember,
  className,
}: DownlineTreeProps<T>) {
  const forest = buildDownline(value, rootId, edge);

  return (
    <div data-fancy-mlm="downline-tree" data-mlm-edge={edge} className={cn("fancy-mlm-tree", className)}>
      <ul className="fancy-mlm-tree__list" role="tree">
        {forest.map((node) => (
          <DownlineNodeView
            key={node.member.id}
            node={node}
            selectedId={selectedId}
            onSelect={onSelect}
            tierColor={tierColor}
            renderMember={renderMember}
          />
        ))}
      </ul>
    </div>
  );
}

function DownlineNodeView<T extends DownlineMember>({
  node,
  selectedId,
  onSelect,
  tierColor,
  renderMember,
}: {
  node: DownlineNode<T>;
  selectedId?: string | null;
  onSelect?: (id: string, member: T) => void;
  tierColor?: (tier: string | undefined) => BadgeColor;
  renderMember?: (member: T, node: DownlineNode<T>) => ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const { member, children } = node;
  const hasChildren = children.length > 0;
  const active = member.active ?? true;

  return (
    <li className="fancy-mlm-tree__item" data-mlm-node={member.id} role="treeitem" aria-expanded={hasChildren ? expanded : undefined}>
      <div
        className={cn(
          "fancy-mlm-tree__row",
          selectedId === member.id && "is-selected",
          !active && "is-inactive",
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            className="fancy-mlm-tree__toggle"
            aria-label={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "▾" : "▸"}
          </button>
        ) : (
          <span className="fancy-mlm-tree__toggle fancy-mlm-tree__toggle--leaf" aria-hidden="true" />
        )}

        <button
          type="button"
          className="fancy-mlm-tree__label"
          data-mlm-member={member.id}
          onClick={() => onSelect?.(member.id, member)}
        >
          {renderMember ? (
            renderMember(member, node)
          ) : (
            <>
              <span className="fancy-mlm-tree__name">{member.label ?? member.id}</span>
              {member.tier ? (
                <Badge color={tierColor?.(member.tier)} variant="soft">
                  {member.tier}
                </Badge>
              ) : null}
              {!active ? <span className="fancy-mlm-tree__muted">inactive</span> : null}
            </>
          )}
        </button>
      </div>

      {hasChildren && expanded ? (
        <ul className="fancy-mlm-tree__list" role="group">
          {children.map((child) => (
            <DownlineNodeView
              key={child.member.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              tierColor={tierColor}
              renderMember={renderMember}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
