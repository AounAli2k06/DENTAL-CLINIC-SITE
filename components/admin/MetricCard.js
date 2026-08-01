const TONES = {
  default: 'bg-white text-brand-dark',
  blue: 'bg-brand-blue text-white',
  teal: 'bg-brand-teal text-white',
  amber: 'bg-amber-500 text-white',
};

export default function MetricCard({ label, value, tone = 'default', icon }) {
  const isDefault = tone === 'default';

  return (
    <div className={`rounded-2xl border border-brand-dark/5 p-5 shadow-card ${TONES[tone] || TONES.default}`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium uppercase tracking-wide ${isDefault ? 'text-brand-dark/50' : 'text-white/70'}`}>
          {label}
        </p>
        {icon}
      </div>
      <p className="mt-3 font-display text-3xl font-medium">{value}</p>
    </div>
  );
}
