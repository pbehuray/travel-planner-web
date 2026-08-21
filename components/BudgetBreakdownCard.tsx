import type { Budget } from '@/lib/api';

export function BudgetBreakdownCard({
  budget,
  tripBudget,
  currency,
}: {
  budget: Budget;
  tripBudget?: number;
  currency?: string;
}) {
  const cur = currency || 'USD';
  const rows: [string, number][] = [
    ['Accommodation', budget.breakdown.accommodation],
    ['Food', budget.breakdown.food],
    ['Transport', budget.breakdown.transport],
    ['Activities', budget.breakdown.activities],
  ];
  if (budget.breakdown.other) rows.push(['Other', budget.breakdown.other]);

  return (
    <div className="card budget-card">
      <h3>Budget breakdown</h3>
      <ul className="budget-rows">
        {rows.map(([label, value]) => (
          <li key={label} className="budget-row">
            <span>{label}</span>
            <span>
              {cur} {value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      <div className="budget-total">
        <span>Total</span>
        <span>
          {cur} {budget.total.toLocaleString()}
        </span>
      </div>
      <div className={`budget-status ${budget.withinBudget ? 'budget-ok' : 'budget-over'}`}>
        {budget.withinBudget ? '✓ Within budget' : '⚠ Over budget'}
        {tripBudget ? ` (target: ${cur} ${tripBudget.toLocaleString()})` : ''}
      </div>
    </div>
  );
}
