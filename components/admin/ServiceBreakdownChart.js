export default function ServiceBreakdownChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return <p className="text-sm text-brand-dark/40">No bookings yet.</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <div key={item.service}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-brand-dark/70">{item.service}</span>
              <span className="font-medium text-brand-dark">
                {item.count} <span className="text-brand-dark/40">({pct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-brand-dark/5">
              <div
                className="h-full rounded-full bg-brand-teal transition-all duration-500"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
