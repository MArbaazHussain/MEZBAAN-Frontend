import { formatPKR } from '../api';

// Event Budget Tracker (SRS 4.6): Budget, Estimated, Remaining
export default function BudgetBar({ status }) {
  if (!status) return null;
  const { budget, estimatedTotal, remaining, isOverBudget, usedPercent } = status;

  if (!budget) {
    return <p className="muted small">Budget set karein taake tracker dikhe.</p>;
  }

  const width = Math.min(usedPercent || 0, 100);
  return (
    <div className="budget">
      <div className="budget-row"><span>Budget</span><strong>{formatPKR(budget)}</strong></div>
      <div className="budget-row"><span>Estimated cost</span><strong>{formatPKR(estimatedTotal)}</strong></div>
      <div className="budget-track">
        <div className={`budget-fill ${isOverBudget ? 'over' : ''}`} style={{ width: `${width}%` }} />
      </div>
      <div className={`budget-row ${isOverBudget ? 'text-danger' : 'text-success'}`}>
        <span>{isOverBudget ? 'Over budget by' : 'Remaining'}</span>
        <strong>{formatPKR(Math.abs(remaining))}</strong>
      </div>
      <p className="muted small">{usedPercent}% of budget used</p>
    </div>
  );
}
