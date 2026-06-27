"use client";

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
  const prompt = buildChatGptPrompt(lesson, question);

  function consultWithGpt() {
    const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
    window.open(chatGptUrl, "_blank", "noopener,noreferrer");
  }

  function useSuggestedDoubt(doubt: string) {
    onQuestionChange(lesson.id, question ? `${question}\n${doubt}` : doubt);
  }

  return (
    <section className="relative rounded-3xl border border-white/10 bg-slate-900/50 p-7 shadow-glow backdrop-blur-md sm:p-9">
      <div className="pointer-events-none absolute -inset-1 -z-10 rounded-3xl bg-cyanGlow/10 blur-2xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warm">
            Dia {lesson.day}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {lesson.phrase}
          </h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
          {isKnown ? "Dominado" : "Pendiente"}
        </span>
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 border-l-4 border-l-cyan-400 bg-cyan-400/10 p-5">
        <p className="text-sm font-bold text-cyan-200">Hoy solo estudia esto</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          No memorices todo. Entiende una frase.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <InfoRow label="Traduccion" value={lesson.translation} />
        <InfoRow label="Pronunciacion" value={lesson.pronunciation} />
        <InfoRow label="Explicacion" value={lesson.explanation} />
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 bg-cyanGlow/10 p-5">
        <p className="text-sm font-semibold text-cyanGlow">Ejemplos practicos</p>
        <div className="mt-3 space-y-2">
          {lesson.examples.map((example) => (
            <p key={example} className="text-sm leading-6 text-slate-200">
              {example}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
        <p className="text-sm font-semibold text-white">Patron</p>
        <p className="mt-2 text-lg font-bold text-cyanGlow">{lesson.pattern}</p>
        <p className="mt-2 text-sm text-slate-400">Repite en voz alta.</p>
      </div>

      <section className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
        {lesson.common_doubts.length > 0 && (
          <div className="space-y-3">
              {lesson.common_doubts.map((doubt) => (
                <article
                  className="rounded-2xl border border-cyanGlow/10 bg-cyanGlow/10 p-4"
                  key={doubt.question}
                >
                  <p className="text-sm font-bold text-cyanGlow">
                    {doubt.question}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {doubt.answer}
                  </p>
                  <button
                    className="mt-3 rounded-2xl border border-cyanGlow/30 px-3 py-2 text-sm font-bold text-cyanGlow transition hover:bg-cyanGlow/10"
                    onClick={() => useSuggestedDoubt(doubt.question)}
                    type="button"
                  >
                    Usar esta duda
                  </button>
                </article>
              ))}
          </div>
        )}

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-white">Mi duda</span>
          <textarea
            className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-base leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyanGlow/60"
            onChange={(event) => onQuestionChange(lesson.id, event.target.value)}
            placeholder="Ejemplo: ¿por qué aquí se usa have?"
            value={question}
          />
        </label>

        <div className="mt-4">
          <button
            className="min-h-12 w-full rounded-2xl bg-cyanGlow px-4 py-3 font-black text-slate-950 transition hover:shadow-[0_0_18px_rgba(94,216,255,0.38)] hover:brightness-105"
            onClick={consultWithGpt}
            type="button"
          >
            Resolver
          </button>
        </div>
      </section>

      <p className="mt-5 text-sm text-slate-400">Mañana repasamos.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          className="min-h-14 rounded-2xl bg-calm px-4 py-3 font-bold text-slate-950 transition hover:brightness-105"
          onClick={() => onMarkKnown(lesson.id)}
          type="button"
        >
          {isKnown ? "Dominado" : "Ya entiendo"}
        </button>
        <button
          className="min-h-14 rounded-2xl border border-review/40 bg-review/10 px-4 py-3 font-bold text-review transition hover:bg-review/15"
          onClick={() => onMarkReview(lesson.id)}
          type="button"
        >
          Necesito repasarlo
        </button>
      </div>
    </section>
  );
}

function buildChatGptPrompt(lesson: Lesson, question: string) {
  const cleanQuestion = question.trim();

  return `Estoy estudiando inglés desde cero con una frase diaria.

Frase: ${lesson.phrase}
Traducción: ${lesson.translation}
Pronunciación aproximada: ${lesson.pronunciation}
Patrón: ${lesson.pattern}
Explicación de la app: ${lesson.explanation}

Mi duda:
${cleanQuestion || "Explícame esta frase en español sencillo."}

Explícamelo con carga cognitiva mínima: sin teoría complicada, con 3 ejemplos parecidos y una forma fácil de recordarlo.`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 leading-6 text-slate-400">{value}</p>
    </div>
  );
}
