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
    <section className="rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-glow">
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

      <div className="mt-5 space-y-3">
        {lessons.map((lesson) => {
          const status = getStatus(lesson.id);
          return (
            <article
              className="rounded-lg border border-white/10 bg-ink/70 p-5"
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
                  className="min-h-12 rounded-lg bg-calm px-4 py-2 font-bold text-slate-950"
                  onClick={() => onMarkKnown(lesson.id)}
                  type="button"
                >
                  Lo se
                </button>
                <button
                  className="min-h-12 rounded-lg border border-review/40 bg-review/10 px-4 py-2 font-bold text-review"
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
      ? "border-calm/30 bg-calm/10 text-calm"
      : status === "review"
        ? "border-review/30 bg-review/10 text-review"
        : "border-warm/30 bg-warm/10 text-warm";

  return (
    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs ${className}`}>
      {label}
    </span>
  );
}
