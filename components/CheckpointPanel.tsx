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
    <section className="rounded-[1.75rem] border border-white/5 bg-[#121212] p-7 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
        Checkpoint suave
      </p>
      <h2 className="mt-2 text-xl font-bold text-white">{checkpoint.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Tres preguntas rápidas. Si algo falla, lo mandamos a Repaso sin bloquearte.
      </p>

      <div className="mt-6 space-y-4">
        {checkpoint.questions.map((question) => (
          <article
            className="rounded-[1.35rem] border border-white/5 bg-[#050505] p-5 backdrop-blur-xl"
            key={question.id}
          >
            <p className="font-bold text-white">{question.prompt}</p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {question.options.map((option) => {
                const isSelected = answers[question.id] === option;
                return (
                  <button
                    className={`min-h-12 rounded-full border px-4 py-2 text-left text-sm font-semibold transition ${
                      isSelected
                        ? "border-[#00f2ff]/70 bg-[#00f2ff] text-black shadow-[0_0_18px_rgba(0,242,255,0.45)]"
                        : "border-white/5 bg-white/[0.04] text-slate-300 hover:border-[#00f2ff]/40"
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
        <div className="mt-5 rounded-[1.25rem] border border-white/5 bg-[#050505] p-4">
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
        className="mt-6 min-h-14 w-full rounded-[1.25rem] bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-500 px-4 py-3 font-black tracking-tight text-black shadow-[0_10px_30px_-10px_rgba(234,179,8,0.5)] transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_18px_45px_-12px_rgba(234,179,8,0.75)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        disabled={!allAnswered || Boolean(result)}
        onClick={finishCheckpoint}
        type="button"
      >
        Terminar checkpoint
      </button>
    </section>
  );
}
