import type { LessonWord } from "@/data/lessons";

type WordsPanelProps = {
  words: LessonWord[];
};

export function WordsPanel({ words }: WordsPanelProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-glow">
      <h2 className="text-xl font-bold text-white">Palabras clave</h2>
      <div className="mt-4 space-y-3">
        {words.map((word) => (
          <article
            className="rounded-lg border border-white/10 bg-ink/70 p-5"
            key={word.word}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-lg font-bold text-warm">{word.word}</p>
              <p className="text-sm text-slate-300">{word.translation}</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">{word.example}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
