type StatCardProps = {
  label: string;
  value: string | number;
  accent?: string;
};

export function StatCard({ label, value, accent = "text-cyanGlow" }: StatCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.055] p-5 shadow-glow">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-normal sm:text-3xl ${accent}`}>
        {value}
      </p>
    </div>
  );
}
