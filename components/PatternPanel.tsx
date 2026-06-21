import type { Lesson } from "@/data/lessons";

const starterPatterns = [
  "I use...",
  "I want...",
  "I need...",
  "I am working on...",
  "I create...",
];

type PatternPanelProps = {
  lessons: Lesson[];
};

export function PatternPanel({ lessons }: PatternPanelProps) {
  const savedPatterns = Array.from(
    new Set([...starterPatterns, ...lessons.map((lesson) => lesson.pattern)]),
  );

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-glow">
      <h2 className="text-xl font-bold text-white">Patrones</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {savedPatterns.map((pattern) => (
          <span
            className="rounded-full border border-cyanGlow/20 bg-cyanGlow/10 px-4 py-2 text-sm font-semibold text-cyanGlow"
            key={pattern}
          >
            {pattern}
          </span>
        ))}
      </div>
    </section>
  );
}
