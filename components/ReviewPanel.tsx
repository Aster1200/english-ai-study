import type { Lesson } from "@/data/lessons";
import type { ReviewStatus } from "@/lib/progress";

type ReviewPanelProps = {
  lessons: Lesson[];
  getStatus: (lessonId: number) => ReviewStatus | "new";
  onMarkKnown: (lessonId: number) => void;
  onMarkReview: (lessonId: number) => void;
};

export function ReviewPanel({
  lessons,
  getStatus,
  onMarkKnown,
  onMarkReview,
}: ReviewPanelProps) {
  return (
    <section className="rounded-[1.75rem] border border-white/5 bg-[#121212] p-7 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-review">
            Modo repaso
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Frases anteriores</h2>
          <p className="mt-2 text-sm text-slate-400">
            Vuelve con calma a lo que todavia necesita practica.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {lessons.map((lesson) => {
          const status = getStatus(lesson.id);
          return (
            <article
              className="rounded-[1.35rem] border border-white/5 bg-[#050505] p-5 backdrop-blur-xl"
              key={lesson.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{lesson.phrase}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {lesson.translation}
                  </p>
                </div>
                <StatusPill status={status} />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  className="min-h-12 rounded-full bg-[#00f2ff] px-4 py-2 font-bold text-black shadow-[0_0_18px_rgba(0,242,255,0.35)]"
                  onClick={() => onMarkKnown(lesson.id)}
                  type="button"
                >
                  Lo se
                </button>
                <button
                  className="min-h-12 rounded-full border border-orange-300/25 bg-orange-500/10 px-4 py-2 font-bold text-orange-200"
                  onClick={() => onMarkReview(lesson.id)}
                  type="button"
                >
                  Repasar
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: ReviewStatus | "new" }) {
  const label =
    status === "known"
      ? "Dominado"
      : status === "review"
        ? "En repaso"
        : "Pendiente";
  const className =
    status === "known"
      ? "border-[#00f2ff]/40 bg-[#00f2ff]/15 text-[#00f2ff] shadow-[0_0_18px_rgba(0,242,255,0.35)]"
      : status === "review"
        ? "border-review/30 bg-review/10 text-review"
        : "border-warm/30 bg-warm/10 text-warm";

  return (
    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs ${className}`}>
      {label}
    </span>
  );
}
