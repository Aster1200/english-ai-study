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
    <section className="relative rounded-[2rem] border border-white/5 bg-[#121212]/95 p-8 shadow-[0_30px_100px_-55px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:p-11">
      <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[2.2rem] bg-[#00f2ff]/10 blur-[70px]" />
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300">
            Dia {lesson.day}
          </p>
          <h2 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {lesson.phrase}
          </h2>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            isKnown
              ? "border-[#00f2ff]/40 bg-[#00f2ff]/15 text-[#00f2ff] shadow-[0_0_18px_rgba(0,242,255,0.4)]"
              : "border-white/5 bg-white/[0.04] text-slate-400"
          }`}
        >
          {isKnown ? "Dominado" : "Pendiente"}
        </span>
      </div>

      <div className="mt-9 w-fit rounded-full border border-[#00f2ff]/20 bg-[#00f2ff]/10 px-5 py-3 shadow-[0_0_24px_rgba(0,242,255,0.12)]">
        <p className="text-sm font-bold text-[#00f2ff]">Hoy solo estudia esto</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        No memorices todo. Entiende una frase.
      </p>

      <div className="mt-8 space-y-5">
        <InfoRow label="Traduccion" value={lesson.translation} />
        <InfoRow label="Pronunciacion" value={lesson.pronunciation} />
        <InfoRow label="Explicacion" value={lesson.explanation} />
      </div>

      <div className="mt-9 rounded-[1.5rem] border border-white/5 bg-black/30 p-6 backdrop-blur-xl">
        <p className="text-sm font-semibold text-[#00f2ff]">Ejemplos practicos</p>
        <div className="mt-4 space-y-3">
          {lesson.examples.map((example) => (
            <p key={example} className="text-sm leading-6 text-slate-300">
              {example}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-7 rounded-[1.5rem] border border-white/5 bg-black/30 p-6 backdrop-blur-xl">
        <p className="text-sm font-semibold text-white">Patron</p>
        <p className="mt-2 text-lg font-bold text-[#00f2ff]">{lesson.pattern}</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          Repite en voz alta.
        </p>
      </div>

      <section className="mt-7 rounded-[1.5rem] border border-white/5 bg-black/30 p-6 backdrop-blur-xl">
        {lesson.common_doubts.length > 0 && (
          <div className="space-y-4">
              {lesson.common_doubts.map((doubt) => (
                <article
                  className="rounded-[1.25rem] border border-white/5 bg-[#121212] p-5"
                  key={doubt.question}
                >
                  <p className="text-sm font-bold text-[#00f2ff]">
                    {doubt.question}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {doubt.answer}
                  </p>
                  <button
                    className="mt-4 rounded-full border border-[#00f2ff]/25 px-4 py-2 text-sm font-bold text-[#00f2ff] transition hover:bg-[#00f2ff]/10 hover:shadow-[0_0_18px_rgba(0,242,255,0.25)]"
                    onClick={() => useSuggestedDoubt(doubt.question)}
                    type="button"
                  >
                    Usar esta duda
                  </button>
                </article>
              ))}
          </div>
        )}

        <label className="mt-7 block">
          <span className="text-sm font-semibold text-white">Mi duda</span>
          <textarea
            className="mt-3 min-h-32 w-full resize-none rounded-[1.25rem] border border-white/5 bg-[#050505] p-5 text-base leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-[#00f2ff]/60 focus:shadow-[0_0_24px_rgba(0,242,255,0.12)]"
            onChange={(event) => onQuestionChange(lesson.id, event.target.value)}
            placeholder="Ejemplo: ¿por qué aquí se usa have?"
            value={question}
          />
        </label>

        <div className="mt-4">
          <button
            className="min-h-14 w-full rounded-[1.25rem] bg-[#00f2ff] px-4 py-3 font-black text-black shadow-[0_0_22px_rgba(0,242,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(0,242,255,0.55)]"
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
          className="min-h-14 rounded-[1.25rem] bg-[#00f2ff] px-4 py-3 font-bold text-black shadow-[0_0_24px_rgba(0,242,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_34px_rgba(0,242,255,0.55)]"
          onClick={() => onMarkKnown(lesson.id)}
          type="button"
        >
          {isKnown ? "Dominado" : "Ya entiendo"}
        </button>
        <button
          className="min-h-14 rounded-[1.25rem] border border-orange-300/25 bg-orange-500/10 px-4 py-3 font-bold text-orange-200 transition hover:bg-orange-500/15"
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
