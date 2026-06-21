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
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.055] p-5 shadow-glow">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Mi Camino de Ingles</h2>
        <span className="text-sm text-slate-400">{lessons.length} dias</span>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {lessons.map((lesson) => {
          const status = getStatus(lesson.id);
          const isActive = activeLessonId === lesson.id;
          const label =
            status === "known"
              ? "Dominado"
              : status === "review"
                ? "En repaso"
                : "Pendiente";
          return (
            <button
              className={`min-h-24 rounded-lg border p-4 text-left transition ${
                isActive
                  ? "border-warm/70 bg-warm text-slate-950"
                  : "border-white/10 bg-ink/70 text-slate-100 hover:border-cyanGlow/40"
              }`}
              key={lesson.id}
              onClick={() => onSelectLesson(lesson.id)}
              type="button"
            >
              <span className="block text-base font-black">Dia {lesson.day}</span>
              <span
                className={`mt-2 block text-sm font-semibold ${
                  isActive ? "text-slate-900" : "text-white"
                }`}
              >
                {lesson.phrase}
              </span>
              <span
                className={`mt-1 block text-xs ${
                  isActive ? "text-slate-800" : "text-slate-400"
                }`}
              >
                Estado: {label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
