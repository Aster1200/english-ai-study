import type { Lesson } from "@/data/lessons";
import type { ReviewStatus } from "@/lib/progress";

type DayRoadmapProps = {
  activeLessonId: number;
  lessons: Lesson[];
  getStatus: (lessonId: number) => ReviewStatus | "new";
  onSelectLesson: (lessonId: number) => void;
};

export function DayRoadmap({
  activeLessonId,
  lessons,
  getStatus,
  onSelectLesson,
}: DayRoadmapProps) {
  const activeIndex = lessons.findIndex((lesson) => lesson.id === activeLessonId);
  const activeLesson = lessons[activeIndex] ?? lessons[0];
  const previousLesson = activeIndex > 0 ? lessons[activeIndex - 1] : null;
  const nextLesson =
    activeIndex >= 0 && activeIndex < lessons.length - 1
      ? lessons[activeIndex + 1]
      : null;
  const status = activeLesson ? getStatus(activeLesson.id) : "new";
  const statusLabel =
    status === "known"
      ? "Dominado"
      : status === "review"
        ? "En repaso"
        : "Pendiente";

  return (
    <section className="rounded-[1.75rem] border border-white/5 bg-[#121212] p-6 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Mi Camino de Ingles</h2>
          <p className="mt-1 text-sm text-slate-400">
            Ruta de {lessons.length} dias. Aqui solo ves la frase activa.
          </p>
        </div>
        <span className="rounded-full border border-[#00f2ff]/20 bg-[#00f2ff]/10 px-3 py-1 text-sm font-bold text-[#00f2ff] shadow-[0_0_18px_rgba(0,242,255,0.15)]">
          Dia {activeLesson?.day ?? 1} de {lessons.length}
        </span>
      </div>

      {activeLesson && (
        <div className="mt-6 rounded-[1.5rem] border border-white/5 bg-[#050505] p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-warm">
                Frase de hoy
              </p>
              <p className="mt-2 text-base font-black text-white">
                {activeLesson.phrase}
              </p>
            </div>
            <span
              className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                status === "known"
                  ? "border-[#00f2ff]/40 bg-[#00f2ff]/15 text-[#00f2ff] shadow-[0_0_18px_rgba(0,242,255,0.35)]"
                  : "border-white/5 bg-white/[0.04] text-slate-400"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className="min-h-12 rounded-full border border-white/5 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-300 transition enabled:hover:border-[#00f2ff]/40 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!previousLesson}
              onClick={() => previousLesson && onSelectLesson(previousLesson.id)}
              type="button"
            >
              Anterior
            </button>
            <button
              className="min-h-12 rounded-full border border-white/5 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-300 transition enabled:hover:border-[#00f2ff]/40 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!nextLesson}
              onClick={() => nextLesson && onSelectLesson(nextLesson.id)}
              type="button"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
