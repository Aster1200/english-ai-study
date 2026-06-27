import type { LessonWord } from "@/data/lessons";

type WordsPanelProps = {
  words: LessonWord[];
};

export function WordsPanel({ words }: WordsPanelProps) {
  return (
    <section className="rounded-[1.75rem] border border-white/5 bg-[#121212] p-7 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl">
      <h2 className="text-xl font-bold text-white">Palabras clave</h2>
      <div className="mt-5 space-y-4">
        {words.map((word) => (
          <article
            className="rounded-[1.35rem] border border-white/5 bg-[#050505] p-5 backdrop-blur-xl"
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
