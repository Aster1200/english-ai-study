import type { Lesson } from "@/data/lessons";

type LessonCardProps = {
  lesson: Lesson;
  isKnown: boolean;
  question: string;
  onMarkKnown: (lessonId: number) => void;
  onMarkReview: (lessonId: number) => void;
  onQuestionChange: (lessonId: number, question: string) => void;
};

export function LessonCard({
  lesson,
  isKnown,
  question,
  onMarkKnown,
  onMarkReview,
  onQuestionChange,
}: LessonCardProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-panel/90 p-6 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warm">
            Dia {lesson.day}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-normal text-white">
            {lesson.phrase}
          </h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
          {isKnown ? "Dominado" : "Pendiente"}
        </span>
      </div>

      <div className="mt-6 rounded-lg border border-warm/20 bg-warm/10 p-4">
        <p className="text-sm font-bold text-warm">Hoy solo estudia esto</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          No memorices todo. Entiende una frase.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <InfoRow label="Traduccion" value={lesson.translation} />
        <InfoRow label="Pronunciacion" value={lesson.pronunciation} />
        <InfoRow label="Explicacion" value={lesson.explanation} />
      </div>

      <div className="mt-6 rounded-lg bg-cyanGlow/10 p-5">
        <p className="text-sm font-semibold text-cyanGlow">Ejemplos practicos</p>
        <div className="mt-3 space-y-2">
          {lesson.examples.map((example) => (
            <p key={example} className="text-sm leading-6 text-slate-200">
              {example}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <p className="text-sm font-semibold text-white">Patron</p>
        <p className="mt-2 text-lg font-bold text-cyanGlow">{lesson.pattern}</p>
        <p className="mt-2 text-sm text-slate-400">Repite en voz alta.</p>
      </div>

      <label className="mt-6 block">
        <span className="text-sm font-semibold text-white">
          Mi pregunta para el profesor
        </span>
        <textarea
          className="mt-3 min-h-28 w-full resize-none rounded-lg border border-white/10 bg-ink/80 p-4 text-base leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanGlow/60"
          onChange={(event) => onQuestionChange(lesson.id, event.target.value)}
          placeholder="Escribe aqui tu duda de esta leccion..."
          value={question}
        />
      </label>

      <p className="mt-5 text-sm text-slate-400">Mañana repasamos.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          className="min-h-14 rounded-lg bg-calm px-4 py-3 font-bold text-slate-950 transition hover:brightness-105"
          onClick={() => onMarkKnown(lesson.id)}
          type="button"
        >
          {isKnown ? "Dominado" : "Ya entiendo"}
        </button>
        <button
          className="min-h-14 rounded-lg border border-review/40 bg-review/10 px-4 py-3 font-bold text-review transition hover:bg-review/15"
          onClick={() => onMarkReview(lesson.id)}
          type="button"
        >
          Necesito repasarlo
        </button>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 leading-6 text-slate-100">{value}</p>
    </div>
  );
}
