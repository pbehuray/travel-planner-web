export function ValidationBadge({ score, passed }: { score?: number; passed?: boolean }) {
  let label = 'Unvalidated';
  let icon = '?';
  let className = 'validation-badge validation-badge-neutral';

  if (typeof score === 'number') {
    if (passed && score >= 70) {
      label = `Validated · ${score}/100`;
      icon = '✓';
      className = 'validation-badge validation-badge-success';
    } else if (score >= 40) {
      label = `Needs review · ${score}/100`;
      icon = '⚠';
      className = 'validation-badge validation-badge-warning';
    } else {
      label = `Low confidence · ${score}/100`;
      icon = '✗';
      className = 'validation-badge validation-badge-error';
    }
  }

  return (
    <span className={className}>
      <span className="validation-badge-icon" aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}
