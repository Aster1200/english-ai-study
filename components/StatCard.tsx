type StatCardProps = {
  label: string;
  value: string | number;
  accent?: string;
};

export function StatCard({ label, value, accent = "text-cyanGlow" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-glow backdrop-blur-md">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-normal sm:text-3xl ${accent}`}>
        {value}
      </p>
    </div>
  );
}
