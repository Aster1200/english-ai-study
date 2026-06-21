"use client";

import { useEffect, useMemo, useState } from "react";
import { DayRoadmap } from "@/components/DayRoadmap";
import { LessonCard } from "@/components/LessonCard";
import { PatternPanel } from "@/components/PatternPanel";
import { ReviewPanel } from "@/components/ReviewPanel";
import { StatCard } from "@/components/StatCard";
import { TeacherNotebook } from "@/components/TeacherNotebook";
import { WordsPanel } from "@/components/WordsPanel";
import { lessons } from "@/data/lessons";
import {
  defaultProgress,
  getProgressStats,
  markStudyDay,
  normalizeProgress,
  progressStorageKey,
  type ReviewStatus,
  type StoredProgress,
} from "@/lib/progress";

type TabKey = "learn" | "review" | "notebook";

const tabs: { key: TabKey; label: string }[] = [
  { key: "learn", label: "Camino" },
  { key: "review", label: "Repaso" },
  { key: "notebook", label: "Libreta" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("learn");
  const [activeLessonId, setActiveLessonId] = useState(lessons[0]?.id ?? 1);
  const [progress, setProgress] = useState<StoredProgress>(defaultProgress);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const rawProgress = window.localStorage.getItem(progressStorageKey);
    if (!rawProgress) {
      setIsReady(true);
      return;
    }

    try {
      setProgress(normalizeProgress(JSON.parse(rawProgress)));
    } catch {
      setProgress(defaultProgress);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  }, [isReady, progress]);

  const stats = useMemo(() => getProgressStats(progress), [progress]);

  const nextLesson = useMemo(() => {
    const nextLesson = lessons.find(
      (lesson) => !progress.knownLessonIds.includes(lesson.id),
    );

    return nextLesson ?? lessons[lessons.length - 1];
  }, [progress.knownLessonIds]);

  const activeLesson = useMemo(() => {
    return (
      lessons.find((lesson) => lesson.id === activeLessonId) ??
      nextLesson ??
      lessons[0]
    );
  }, [activeLessonId, nextLesson]);

  useEffect(() => {
    if (isReady && nextLesson) {
      setActiveLessonId(nextLesson.id);
    }
  }, [isReady, nextLesson]);

  function updateLessonStatus(lessonId: number, status: ReviewStatus) {
    setProgress((current) => {
      const studiedLessonIds = Array.from(
        new Set([...current.studiedLessonIds, lessonId]),
      );
      const withoutKnown = current.knownLessonIds.filter((id) => id !== lessonId);
      const withoutReview = current.reviewLessonIds.filter((id) => id !== lessonId);
      const nextProgress = markStudyDay({
        ...current,
        studiedLessonIds,
        knownLessonIds:
          status === "known" ? [...withoutKnown, lessonId] : withoutKnown,
        reviewLessonIds:
          status === "review" ? [...withoutReview, lessonId] : withoutReview,
      });

      return nextProgress;
    });
  }

  function updateLessonQuestion(lessonId: number, question: string) {
    setProgress((current) => ({
      ...current,
      lessonQuestions: {
        ...current.lessonQuestions,
        [lessonId]: question,
      },
    }));
  }

  function updateGeneralQuestion(question: string) {
    setProgress((current) => ({
      ...current,
      generalQuestion: question,
    }));
  }

  function updateTeacherAnswer(answer: string) {
    setProgress((current) => ({
      ...current,
      teacherAnswer: answer,
    }));
  }

  function getStatus(lessonId: number) {
    if (progress.knownLessonIds.includes(lessonId)) {
      return "known";
    }

    if (progress.reviewLessonIds.includes(lessonId)) {
      return "review";
    }

    return "new";
  }

  return (
    <main className="min-h-screen px-4 pb-28 pt-5 sm:px-6 sm:pb-10">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-lg border border-white/10 bg-white/[0.055] p-6 shadow-glow sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyanGlow sm:text-sm">
            English AI Study
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">
            Mi Camino de Ingles
          </h1>
          <p className="mt-2 text-base font-semibold text-warm">
            Un paso diario. Sin presion. Con direccion.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Una ruta diaria, simple y ordenada para estudiar sin confundirte:
            abre la app, entra al siguiente dia y guarda tus dudas.
          </p>
          <button
            className="mt-6 min-h-14 w-full rounded-lg bg-warm px-5 py-4 text-base font-black text-slate-950 shadow-glow transition hover:brightness-105 sm:w-auto"
            onClick={() => {
              setActiveTab("learn");
              setActiveLessonId(nextLesson.id);
            }}
            type="button"
          >
            Estudiar leccion de hoy
          </button>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Progreso total" value={`${stats.totalProgress}%`} />
          <StatCard label="Frases" value={stats.learnedPhraseCount} />
          <StatCard label="Palabras" value={stats.learnedWordCount} />
          <StatCard
            accent="text-calm"
            label="Racha"
            value={`${stats.streak} dias`}
          />
        </section>

        <section className="mt-4 rounded-lg border border-white/10 bg-white/[0.055] p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-white">Avance del camino</p>
            <p className="text-sm font-bold text-calm">{stats.totalProgress}%</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-calm transition-all"
              style={{ width: `${stats.totalProgress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Repite en voz alta. No memorices todo. Entiende una frase.
          </p>
        </section>

        <nav className="fixed inset-x-4 bottom-4 z-20 rounded-lg border border-white/10 bg-ink/95 p-1 shadow-glow backdrop-blur sm:sticky sm:top-3 sm:mt-5">
          <div className="grid grid-cols-3 gap-1">
            {tabs.map((tab) => (
              <button
                className={`min-h-14 rounded-md px-3 py-2 text-sm font-bold transition ${
                  activeTab === tab.key
                    ? "bg-cyanGlow text-slate-950"
                    : "text-slate-300 hover:bg-white/[0.06]"
                }`}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-5 space-y-5">
          {activeTab === "learn" && (
            <>
              <DayRoadmap
                activeLessonId={activeLesson.id}
                getStatus={getStatus}
                lessons={lessons}
                onSelectLesson={setActiveLessonId}
              />
              <LessonCard
                isKnown={getStatus(activeLesson.id) === "known"}
                lesson={activeLesson}
                onMarkKnown={(lessonId) => updateLessonStatus(lessonId, "known")}
                onMarkReview={(lessonId) =>
                  updateLessonStatus(lessonId, "review")
                }
                onQuestionChange={updateLessonQuestion}
                question={progress.lessonQuestions[activeLesson.id] ?? ""}
              />
              <WordsPanel words={activeLesson.words} />
              <PatternPanel lessons={lessons} />
            </>
          )}

          {activeTab === "review" && (
            <ReviewPanel
              getStatus={getStatus}
              lessons={lessons}
              onMarkKnown={(lessonId) => updateLessonStatus(lessonId, "known")}
              onMarkReview={(lessonId) => updateLessonStatus(lessonId, "review")}
            />
          )}

          {activeTab === "notebook" && (
            <TeacherNotebook
              generalQuestion={progress.generalQuestion}
              onGeneralQuestionChange={updateGeneralQuestion}
              onTeacherAnswerChange={updateTeacherAnswer}
              teacherAnswer={progress.teacherAnswer}
            />
          )}
        </div>
      </div>
    </main>
  );
}
