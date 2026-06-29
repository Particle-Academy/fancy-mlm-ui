import { cn, Badge } from "@particle-academy/react-fancy";
import type { CommissionRow } from "./types";

export interface CommissionStatementProps {
  /** Reward rows (controlled) — typically the engine's RewardComputation list. */
  rows: CommissionRow[];
  /** Format an amount for display (default: `toLocaleString`). */
  formatAmount?: (amount: number, row: CommissionRow) => string;
  /** Shown when there are no rows. */
  emptyLabel?: string;
  className?: string;
}

/**
 * A commission / referral-bonus statement. Each row carries a stable
 * `data-mlm-commission-row` handle; reversed rows are struck through and
 * excluded from the paid total.
 */
export function CommissionStatement({
  rows,
  formatAmount,
  emptyLabel = "No commissions yet.",
  className,
}: CommissionStatementProps) {
  const format = formatAmount ?? ((amount: number) => amount.toLocaleString());
  const paidTotal = rows
    .filter((row) => !row.status || row.status === "paid")
    .reduce((sum, row) => sum + row.amount, 0);

  if (rows.length === 0) {
    return (
      <div data-fancy-mlm="commission-statement" className={cn("fancy-mlm-statement is-empty", className)}>
        {emptyLabel}
      </div>
    );
  }

  return (
    <div data-fancy-mlm="commission-statement" className={cn("fancy-mlm-statement", className)}>
      <table className="fancy-mlm-statement__table">
        <thead>
          <tr>
            <th className="fancy-mlm-statement__num">Level</th>
            <th>Recipient</th>
            <th>Tier</th>
            <th className="fancy-mlm-statement__num">Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const status = row.status ?? "paid";
            return (
              <tr
                key={row.id ?? `${row.recipientMemberId ?? "row"}-${index}`}
                data-mlm-commission-row={row.id ?? row.recipientMemberId}
                data-mlm-status={status}
                className={cn(status === "reversed" && "is-reversed")}
              >
                <td className="fancy-mlm-statement__num">{row.level}</td>
                <td>{row.recipientLabel ?? row.recipientMemberId ?? "—"}</td>
                <td>{row.tier ? <Badge variant="soft">{row.tier}</Badge> : null}</td>
                <td className="fancy-mlm-statement__num">{format(row.amount, row)}</td>
                <td>
                  <Badge variant="soft">{status}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="fancy-mlm-statement__total-label">Total (paid)</td>
            <td className="fancy-mlm-statement__num fancy-mlm-statement__total">{format(paidTotal, rows[0]!)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
