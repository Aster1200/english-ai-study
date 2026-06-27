type StatCardProps = {
  label: string;
  value: string | number;
  accent?: string;
};

export function StatCard({ label, value, accent = "text-[#00f2ff]" }: StatCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-white/5 bg-[#121212] p-6 shadow-[0_22px_70px_-50px_rgba(0,0,0,0.95)] backdrop-blur-xl">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-normal sm:text-3xl ${accent}`}>
        {value}
      </p>
    </div>
  );
}
