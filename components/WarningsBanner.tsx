export function WarningsBanner({ warnings }: { warnings?: string[] }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="alert alert-warning" role="alert">
      <strong>Some parts of this plan used fallback data:</strong>
      <ul>
        {warnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
