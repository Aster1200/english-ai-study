import { useState } from "react";
import type { Checkpoint } from "@/data/lessons";

type CheckpointPanelProps = {
  checkpoint: Checkpoint;
  onComplete: (checkpointId: number, mistakeLessonIds: number[]) => void;
};

export function CheckpointPanel({ checkpoint, onComplete }: CheckpointPanelProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    correct: number;
    total: number;
    mistakeLessonIds: number[];
  } | null>(null);

  const allAnswered = checkpoint.questions.every(
    (question) => answers[question.id],
  );

  function finishCheckpoint() {
    const wrongQuestionCount = checkpoint.questions.filter(
      (question) => answers[question.id] !== question.answer,
    ).length;
    const mistakeLessonIds = checkpoint.questions.flatMap((question) =>
      answers[question.id] === question.answer ? [] : question.reviewLessonIds,
    );
    const uniqueMistakeLessonIds = Array.from(new Set(mistakeLessonIds));

    setResult({
      correct: checkpoint.questions.length - wrongQuestionCount,
      total: checkpoint.questions.length,
      mistakeLessonIds: uniqueMistakeLessonIds,
    });
    onComplete(checkpoint.id, uniqueMistakeLessonIds);
  }

  return (
    <section className="rounded-2xl border border-warm/20 bg-slate-900/50 p-6 shadow-glow backdrop-blur-md">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warm">
        Checkpoint suave
      </p>
      <h2 className="mt-2 text-xl font-bold text-white">{checkpoint.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Tres preguntas rápidas. Si algo falla, lo mandamos a Repaso sin bloquearte.
      </p>

      <div className="mt-5 space-y-4">
        {checkpoint.questions.map((question) => (
          <article
            className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 backdrop-blur-md"
            key={question.id}
          >
            <p className="font-bold text-white">{question.prompt}</p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {question.options.map((option) => {
                const isSelected = answers[question.id] === option;
                return (
                  <button
                    className={`min-h-12 rounded-2xl border px-4 py-2 text-left text-sm font-semibold transition ${
                      isSelected
                        ? "border-cyanGlow/70 bg-cyanGlow text-slate-950"
                        : "border-white/10 bg-white/[0.04] text-slate-200 hover:border-cyanGlow/40"
                    }`}
                    key={option}
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: option,
                      }))
                    }
                    type="button"
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      {result && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <p className="font-bold text-white">
            Resultado: {result.correct}/{result.total}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {result.mistakeLessonIds.length === 0
              ? "Muy bien. Puedes seguir con calma."
              : "Listo. Las frases con error quedaron marcadas para Repaso."}
          </p>
        </div>
      )}

      <button
        className="mt-5 min-h-14 w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-3 font-black text-slate-950 transition enabled:hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        disabled={!allAnswered || Boolean(result)}
        onClick={finishCheckpoint}
        type="button"
      >
        Terminar checkpoint
      </button>
    </section>
  );
}
