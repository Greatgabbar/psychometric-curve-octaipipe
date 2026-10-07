// Tells the operator, in words, whether the hall is inside the SLA, and if not, why.
// Shows "unknown" when the data is stale: we never show a confident green on old data.

import { formatTime } from '../format';
import type { ComplianceResult, Violation } from '../sla/compliance';

interface SlaStatusBadgeProps {
  compliance: ComplianceResult;
  isStale: boolean;
  lastReadingTime: string;
  errorMessage?: string;
}

function describeViolation(v: Violation): string {
  const value = v.unit === '%' ? v.value.toFixed(0) : v.value.toFixed(1);
  return `${v.label} ${value} ${v.unit} (${v.kind} ${v.limit} ${v.unit})`;
}

export function SlaStatusBadge({ compliance, isStale, lastReadingTime, errorMessage }: SlaStatusBadgeProps) {
  if (isStale) {
    return (
      <div className="status status-unknown">
        {/* Only the short title is announced to screen readers, so they aren't
            interrupted every 2 seconds by changing numbers. */}
        <p className="status-title" role="status" aria-live="polite">
          <span aria-hidden="true">?</span> Status unknown
        </p>
        <p className="status-detail">
          No new data since {formatTime(lastReadingTime)}. {errorMessage} Retrying automatically.
        </p>
      </div>
    );
  }

  if (compliance.isCompliant) {
    return (
      <div className="status status-inside">
        <p className="status-title" role="status" aria-live="polite">
          <span aria-hidden="true">✓</span> Within SLA
        </p>
        <p className="status-detail">All five limits are met.</p>
      </div>
    );
  }

  return (
    <div className="status status-outside">
      <p className="status-title" role="status" aria-live="polite">
        <span aria-hidden="true">!</span> Outside SLA
      </p>
      <ul className="status-detail">
        {compliance.violations.map((v) => (
          <li key={`${v.label}-${v.kind}`}>{describeViolation(v)}</li>
        ))}
      </ul>
    </div>
  );
}
