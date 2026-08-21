export function ValidationBadge({ score, passed }: { score?: number; passed?: boolean }) {
  let label = 'Unvalidated';
  let className = 'badge badge-neutral';

  if (typeof score === 'number') {
    if (passed && score >= 70) {
      label = `Validated · ${score}/100`;
      className = 'badge badge-success';
    } else if (score >= 40) {
      label = `Needs review · ${score}/100`;
      className = 'badge badge-warning';
    } else {
      label = `Low confidence · ${score}/100`;
      className = 'badge badge-error';
    }
  }

  return <span className={className}>{label}</span>;
}
