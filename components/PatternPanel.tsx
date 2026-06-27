"use client";

import { useMemo, useState } from "react";
import type { Lesson } from "@/data/lessons";

const patternCategories = [
  {
    stageId: 1,
    title: "Necesidades y bases personales",
    description: "Moldes para decir que usas, quieres, necesitas o entiendes algo.",
  },
  {
    stageId: 2,
    title: "Tecnologia e IA",
    description: "Moldes para hablar de apps, IA, errores, codigo y proyectos.",
  },
  {
    stageId: 3,
    title: "Trabajo y productividad",
    description: "Moldes para tareas, reuniones, tiempo, soluciones y avances.",
  },
  {
    stageId: 4,
    title: "Conversacion diaria",
    description: "Moldes para responder, pedir ayuda y conversar de forma simple.",
  },
  {
    stageId: 5,
    title: "Combinaciones y confianza",
    description: "Moldes para combinar lo aprendido y crear frases propias.",
  },
];

type PatternPanelProps = {
  lessons: Lesson[];
};

export function PatternPanel({ lessons }: PatternPanelProps) {
  const [openStageIds, setOpenStageIds] = useState<number[]>([1]);
  const groupedPatterns = useMemo(
    () =>
      patternCategories.map((category) => {
        const patternMap = new Map<string, Lesson>();

        lessons
          .filter((lesson) => lesson.stageId === category.stageId)
          .forEach((lesson) => {
            if (!patternMap.has(lesson.pattern)) {
              patternMap.set(lesson.pattern, lesson);
            }
          });

        return {
          ...category,
          patterns: Array.from(patternMap.entries()).map(([pattern, lesson]) => ({
            pattern,
            example: lesson.phrase,
            translation: lesson.translation,
          })),
        };
      }),
    [lessons],
  );

  function toggleStage(stageId: number) {
    setOpenStageIds((current) =>
      current.includes(stageId)
        ? current.filter((id) => id !== stageId)
        : [...current, stageId],
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-glow backdrop-blur-md">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyanGlow">
        Toolbox
      </p>
      <h2 className="mt-2 text-xl font-bold text-white">Mis Moldes</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Biblioteca de patrones organizada por uso. Abre solo la categoria que
        necesites.
      </p>

      <div className="mt-5 space-y-3">
        {groupedPatterns.map((category) => {
          const isOpen = openStageIds.includes(category.stageId);

          return (
            <article
              className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 backdrop-blur-md"
              key={category.stageId}
            >
              <button
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-white/[0.04]"
                onClick={() => toggleStage(category.stageId)}
                type="button"
              >
                <div>
                  <h3 className="font-bold text-white">{category.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {category.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-cyanGlow/20 bg-cyanGlow/10 px-3 py-1 text-sm font-bold text-cyanGlow">
                  {isOpen ? "Cerrar" : "Abrir"}
                </span>
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-white/10 p-5">
                  {category.patterns.map((item) => (
                    <div
                      className="rounded-2xl border border-cyanGlow/10 bg-cyanGlow/10 p-4"
                      key={item.pattern}
                    >
                      <p className="font-bold text-cyanGlow">{item.pattern}</p>
                      <p className="mt-2 text-sm text-slate-200">{item.example}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.translation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
