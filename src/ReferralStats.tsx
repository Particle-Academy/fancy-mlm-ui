import { cn, Button, Card, Chart, DatePicker, MultiSwitch, Table, Text } from "@particle-academy/react-fancy";
import { formatRate as defaultFormatRate, statsChartData, summarizeStats } from "./stats";
import type { ReferralStatRow, ReferralStatsGroupBy, ReferralStatsMetric, ReferralStatsRange } from "./types";

export interface ReferralStatsProps {
  /** Stats rows (controlled), as the engines' `stats()` returns them. */
  rows: ReferralStatRow[];
  /** What the rows are grouped by (controlled). Shown as a switch only when `onGroupByChange` is set. */
  groupBy?: ReferralStatsGroupBy;
  onGroupByChange?: (groupBy: ReferralStatsGroupBy) => void;
  /** Which figure the chart plots (controlled). Default `signups`. */
  metric?: ReferralStatsMetric;
  onMetricChange?: (metric: ReferralStatsMetric) => void;
  /** The range the rows cover, `YYYY-MM-DD` (controlled). Shown as a picker only when `onRangeChange` is set. */
  range?: ReferralStatsRange;
  onRangeChange?: (range: ReferralStatsRange) => void;
  /** Highlighted row (controlled). */
  selectedKey?: string | null;
  onSelect?: (key: string, row: ReferralStatRow) => void;
  /**
   * Ungrouped totals from the engine. Without them, scans and signups are
   * summed and unique sessions and conversion are left blank, because they
   * cannot be summed honestly.
   */
  totals?: Omit<ReferralStatRow, "key" | "label">;
  /** Column heading for the key. Default from `groupBy`. */
  keyLabel?: string;
  formatRate?: (rate: number) => string;
  emptyLabel?: string;
  className?: string;
}

const GROUPS: Array<{ value: ReferralStatsGroupBy; label: string }> = [
  { value: "code", label: "Code" },
  { value: "scope", label: "Scope" },
  { value: "member", label: "Member" },
];

const METRICS: Array<{ value: ReferralStatsMetric; label: string }> = [
  { value: "scans", label: "Scans" },
  { value: "uniqueSessions", label: "Visitors" },
  { value: "signups", label: "Signups" },
  { value: "conversionRate", label: "Conversion" },
];

const COLUMNS: Array<{ stat: ReferralStatsMetric; label: string }> = [
  { stat: "scans", label: "Scans" },
  { stat: "uniqueSessions", label: "Visitors" },
  { stat: "signups", label: "Signups" },
  { stat: "conversionRate", label: "Conversion" },
];

/**
 * Referral conversion stats per code, scope or member: a bar chart of one
 * metric over a table of all four.
 *
 * Human+: every piece of state is a controlled prop, the state is mirrored on
 * the root as `data-mlm-*` attributes, every cell carries
 * `data-mlm-stat-key` + `data-mlm-stat`, and each control sits in a
 * `data-mlm-control` wrapper, so an agent reads and drives it without guessing
 * at the DOM.
 */
export function ReferralStats({
  rows,
  groupBy = "code",
  onGroupByChange,
  metric = "signups",
  onMetricChange,
  range,
  onRangeChange,
  selectedKey = null,
  onSelect,
  totals,
  keyLabel,
  formatRate = defaultFormatRate,
  emptyLabel = "No referral activity in this range.",
  className,
}: ReferralStatsProps) {
  const summed = summarizeStats(rows);
  const show = (stat: ReferralStatsMetric, row: Pick<ReferralStatRow, ReferralStatsMetric>) =>
    stat === "conversionRate" ? formatRate(row.conversionRate) : row[stat].toLocaleString();
  const total = (stat: ReferralStatsMetric): string => {
    if (totals) return show(stat, totals);
    if (stat === "scans" || stat === "signups") return summed[stat].toLocaleString();
    return "—";
  };

  return (
    <Card
      variant="outlined"
      padding="md"
      data-fancy-mlm="referral-stats"
      data-mlm-group-by={groupBy}
      data-mlm-metric={metric}
      data-mlm-range-from={range?.from}
      data-mlm-range-to={range?.to}
      data-mlm-selected-key={selectedKey ?? undefined}
      data-mlm-empty={rows.length === 0 ? "true" : undefined}
      className={cn("fancy-mlm-stats", className)}
    >
      {onGroupByChange || onMetricChange || onRangeChange ? (
        <div className="fancy-mlm-stats__controls">
          {onGroupByChange ? (
            <div data-mlm-control="group-by">
              <MultiSwitch<ReferralStatsGroupBy> label="Group by" list={GROUPS} value={groupBy} onValueChange={onGroupByChange} />
            </div>
          ) : null}
          {onMetricChange ? (
            <div data-mlm-control="metric">
              <MultiSwitch<ReferralStatsMetric> label="Chart" list={METRICS} value={metric} onValueChange={onMetricChange} />
            </div>
          ) : null}
          {onRangeChange ? (
            <div data-mlm-control="range">
              <DatePicker
                range
                label="Range"
                value={range ? [range.from, range.to] : undefined}
                onValueChange={([from, to]) => onRangeChange({ from, to })}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <Text className="fancy-mlm-stats__empty">{emptyLabel}</Text>
      ) : (
        <>
          <div data-mlm-chart={metric}>
            <Chart.Bar data={statsChartData(rows, metric)} height={180} showValues />
          </div>

          <Table className="fancy-mlm-stats__table">
            <Table.Head>
              <Table.Row>
                <Table.Cell header>{keyLabel ?? GROUPS.find((g) => g.value === groupBy)?.label ?? "Key"}</Table.Cell>
                {COLUMNS.map((c) => (
                  <Table.Cell header key={c.stat} className="fancy-mlm-stats__num">
                    {c.label}
                  </Table.Cell>
                ))}
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {rows.map((row) => {
                const selected = row.key === selectedKey;
                return (
                  <Table.Row key={row.key} className={cn(selected && "is-selected")} onClick={onSelect ? () => onSelect(row.key, row) : undefined}>
                    <Table.Cell data-mlm-stat-key={row.key} data-mlm-stat="key" data-mlm-selected={selected ? "true" : undefined}>
                      {onSelect ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          data-mlm-select={row.key}
                          aria-pressed={selected}
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelect(row.key, row);
                          }}
                        >
                          {row.label ?? row.key}
                        </Button>
                      ) : (
                        row.label ?? row.key
                      )}
                    </Table.Cell>
                    {COLUMNS.map((c) => (
                      <Table.Cell key={c.stat} data-mlm-stat-key={row.key} data-mlm-stat={c.stat} className="fancy-mlm-stats__num">
                        {show(c.stat, row)}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                );
              })}
            </Table.Body>
            <tfoot>
              <Table.Row>
                <Table.Cell header>Total</Table.Cell>
                {COLUMNS.map((c) => (
                  <Table.Cell key={c.stat} data-mlm-total={c.stat} className="fancy-mlm-stats__num">
                    {total(c.stat)}
                  </Table.Cell>
                ))}
              </Table.Row>
            </tfoot>
          </Table>
        </>
      )}
    </Card>
  );
}
