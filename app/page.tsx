"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckpointPanel } from "@/components/CheckpointPanel";
import { DayRoadmap } from "@/components/DayRoadmap";
import { LessonCard } from "@/components/LessonCard";
import { PatternPanel } from "@/components/PatternPanel";
import { ReviewPanel } from "@/components/ReviewPanel";
import { StatCard } from "@/components/StatCard";
import { TeacherNotebook } from "@/components/TeacherNotebook";
import { WordsPanel } from "@/components/WordsPanel";
import { checkpoints, lessons } from "@/data/lessons";
import {
  defaultProgress,
  getProgressStats,
  markStudyDay,
  normalizeProgress,
  progressStorageKey,
  type ReviewStatus,
  type StoredProgress,
} from "@/lib/progress";

type TabKey = "learn" | "review" | "patterns" | "notebook";

const tabs: { key: TabKey; label: string }[] = [
  { key: "learn", label: "Camino" },
  { key: "review", label: "Repaso" },
  { key: "patterns", label: "Moldes" },
  { key: "notebook", label: "Libreta" },
];

function getNextUnstudiedLesson(studiedLessonIds: number[], currentLessonId?: number) {
  const studiedIds = new Set(studiedLessonIds);
  const nextAfterCurrent =
    typeof currentLessonId === "number"
      ? lessons.find(
          (lesson) => lesson.id > currentLessonId && !studiedIds.has(lesson.id),
        )
      : undefined;

  return (
    nextAfterCurrent ??
    lessons.find((lesson) => !studiedIds.has(lesson.id)) ??
    lessons[lessons.length - 1]
  );
}

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

  const pendingCheckpoint = useMemo(() => {
    const studiedLessonIds = new Set(progress.studiedLessonIds);

    return checkpoints.find((checkpoint) => {
      const isCompleted = progress.completedCheckpointIds.includes(checkpoint.id);
      const isReady = lessons
        .filter((lesson) => lesson.id <= checkpoint.afterLessonId)
        .every((lesson) => studiedLessonIds.has(lesson.id));

      return isReady && !isCompleted;
    });
  }, [progress.completedCheckpointIds, progress.studiedLessonIds]);

  const nextLesson = useMemo(() => {
    return getNextUnstudiedLesson(progress.studiedLessonIds);
  }, [progress.studiedLessonIds]);

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
    const numericLessonId = Number(lessonId);

    setProgress((current) => {
      const studiedLessonIds = Array.from(
        new Set([...current.studiedLessonIds, numericLessonId]),
      );
      const withoutKnown = current.knownLessonIds.filter(
        (id) => id !== numericLessonId,
      );
      const withoutReview = current.reviewLessonIds.filter(
        (id) => id !== numericLessonId,
      );
      const nextProgress = markStudyDay({
        ...current,
        studiedLessonIds,
        knownLessonIds:
          status === "known" ? [...withoutKnown, numericLessonId] : withoutKnown,
        reviewLessonIds:
          status === "review" ? [...withoutReview, numericLessonId] : withoutReview,
      });

      return nextProgress;
    });

    if (numericLessonId === activeLesson.id) {
      setActiveLessonId(
        getNextUnstudiedLesson(
          Array.from(new Set([...progress.studiedLessonIds, numericLessonId])),
          numericLessonId,
        ).id,
      );
    }
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

  function completeCheckpoint(checkpointId: number, mistakeLessonIds: number[]) {
    setProgress((current) => {
      const uniqueMistakes = Array.from(new Set(mistakeLessonIds));
      const completedCheckpointIds = Array.from(
        new Set([...current.completedCheckpointIds, checkpointId]),
      );
      const reviewLessonIds = Array.from(
        new Set([...current.reviewLessonIds, ...uniqueMistakes]),
      );
      const knownLessonIds =
        uniqueMistakes.length === 0
          ? current.knownLessonIds
          : current.knownLessonIds.filter((id) => !uniqueMistakes.includes(id));

      return {
        ...current,
        completedCheckpointIds,
        checkpointMistakes: {
          ...current.checkpointMistakes,
          [checkpointId]: uniqueMistakes,
        },
        knownLessonIds,
        reviewLessonIds,
      };
    });
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
    <main className="min-h-screen px-4 pb-32 pt-5 sm:px-6 sm:pb-12">
      <div className="mx-auto max-w-5xl">
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-7 shadow-glow backdrop-blur-md sm:p-9">
          <div className="absolute -right-20 -top-24 h-60 w-60 rounded-full bg-cyanGlow/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyanGlow/70 to-transparent" />
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyanGlow sm:text-sm">
              English AI Study
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Mi Camino de Ingles
            </h1>
            <p className="mt-3 text-base font-semibold text-warm">
              Un paso diario. Sin presion. Con direccion.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Una ruta diaria y ordenada para estudiar sin saturarte: abre la
              app, entra a tu frase del dia y guarda tus dudas.
            </p>
          </div>
          <button
            className="relative mt-7 min-h-14 w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-4 text-base font-black text-slate-950 shadow-glow transition hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] sm:w-auto"
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

        <section className="mt-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5 shadow-glow backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-white">Avance del camino</p>
            <p className="text-sm font-bold text-calm">{stats.totalProgress}%</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 transition-all"
              style={{ width: `${stats.totalProgress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Repite en voz alta. No memorices todo. Entiende una frase.
          </p>
        </section>

        <nav className="fixed bottom-4 left-4 right-4 z-20 rounded-full border border-white/10 bg-white/5 p-1.5 shadow-glow backdrop-blur-lg sm:sticky sm:top-3 sm:mt-5">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab) => (
              <button
                className={`min-h-12 rounded-full px-3 py-2 text-sm font-bold transition ${
                  activeTab === tab.key
                    ? "bg-cyanGlow text-slate-950 shadow-[0_0_18px_rgba(94,216,255,0.45)]"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
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
              {pendingCheckpoint && (
                <CheckpointPanel
                  checkpoint={pendingCheckpoint}
                  onComplete={completeCheckpoint}
                />
              )}
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

          {activeTab === "patterns" && <PatternPanel lessons={lessons} />}

          {activeTab === "notebook" && (
            <TeacherNotebook
              generalQuestion={progress.generalQuestion}
              onGeneralQuestionChange={updateGeneralQuestion}
              onTeacherAnswerChange={updateTeacherAnswer}
              teacherAnswer={progress.teacherAnswer}
            />
          )}
        </div>

        <footer className="py-10 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
            Built by Aster
          </p>
        </footer>
      </div>
    </main>
  );
}
