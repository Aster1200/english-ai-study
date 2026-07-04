"use client";

import { useEffect, useMemo, useState } from "react";
import { PatternPanel } from "@/components/PatternPanel";
import { TeacherNotebook } from "@/components/TeacherNotebook";
import { lessons } from "@/data/lessons";
import {
  buildTrainingSession,
  completeTrainingSession,
  defaultProgress,
  getNextPendingLesson,
  getProgressStats,
  markLessonNeedsPractice,
  markLessonRemembered,
  normalizeProgress,
  progressStorageKey,
  type StoredProgress,
  type TrainingSession,
} from "@/lib/progress";

type TabKey = "learn" | "library" | "settings";
type LibraryFilter = "known" | "pending" | "review";

const tabs: { key: TabKey; label: string }[] = [
  { key: "learn", label: "Camino" },
  { key: "library", label: "Biblioteca" },
  { key: "settings", label: "Libreta" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("learn");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(
    null,
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dailyLessonId, setDailyLessonId] = useState<number | null>(null);
  const [dailyLearnedLessonIds, setDailyLearnedLessonIds] = useState<number[]>(
    [],
  );
  const [isDayFinished, setIsDayFinished] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
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
  const reinforcementCount = useMemo(
    () => new Set(progress.reviewLessonIds).size,
    [progress.reviewLessonIds],
  );
  const currentStep = currentSession?.steps[currentStepIndex] ?? null;
  const currentSessionLesson = currentStep?.lessonId
    ? lessons.find((lesson) => lesson.id === currentStep.lessonId) ?? null
    : null;
  const dailyLesson = dailyLessonId
    ? lessons.find((lesson) => lesson.id === dailyLessonId) ?? null
    : null;

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

  function updateLessonQuestion(lessonId: number, question: string) {
    setProgress((current) => ({
      ...current,
      lessonQuestions: {
        ...current.lessonQuestions,
        [lessonId]: question,
      },
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

  function startTrainingSession() {
    setCurrentSession(buildTrainingSession(progress, lessons));
    setCurrentStepIndex(0);
    setDailyLessonId(null);
    setDailyLearnedLessonIds([]);
    setIsDayFinished(false);
    setIsStudying(true);
    setActiveTab("learn");
  }

  function finishCurrentSessionStep(outcome: "remembered" | "needsPractice") {
    if (!currentSession || !currentSessionLesson) {
      return;
    }

    const nextStep = currentSession.steps[currentStepIndex + 1];
    const shouldCompleteSession = nextStep?.type === "closing";

    setProgress((current) => {
      const updatedProgress =
        outcome === "remembered"
          ? markLessonRemembered(current, currentSessionLesson.id)
          : markLessonNeedsPractice(current, currentSessionLesson.id);

      return shouldCompleteSession
        ? completeTrainingSession(updatedProgress, currentSession)
        : updatedProgress;
    });

    setCurrentStepIndex((index) =>
      Math.min(index + 1, currentSession.steps.length - 1),
    );
  }

  function resetTrainingSession() {
    setCurrentSession(null);
    setCurrentStepIndex(0);
    setDailyLessonId(null);
    setDailyLearnedLessonIds([]);
    setIsDayFinished(false);
    setIsStudying(false);
  }

  function startDailyLesson() {
    const nextPendingLesson = getNextPendingLesson(progress, lessons);

    setCurrentSession(null);
    setCurrentStepIndex(0);
    setDailyLearnedLessonIds([]);
    setIsDayFinished(false);
    setDailyLessonId(nextPendingLesson?.id ?? null);
    setIsStudying(true);
    setActiveTab("learn");
  }

  function continueDailyPath() {
    const nextPendingLesson = getNextPendingLesson(progress, lessons);

    setCurrentSession(null);
    setCurrentStepIndex(0);
    setIsDayFinished(false);
    setDailyLessonId(nextPendingLesson?.id ?? null);
    setIsStudying(true);
    setActiveTab("learn");
  }

  function finishDailyLesson(outcome: "remembered" | "needsPractice") {
    if (!dailyLesson) {
      return;
    }

    const updatedProgress =
      outcome === "remembered"
        ? markLessonRemembered(progress, dailyLesson.id)
        : markLessonNeedsPractice(progress, dailyLesson.id);
    setProgress(updatedProgress);
    setDailyLearnedLessonIds((current) => [
      ...new Set([...current, dailyLesson.id]),
    ]);
    setDailyLessonId(null);
  }

  function finishDay() {
    setIsDayFinished(true);
    setIsStudying(false);
  }

  return (
    <main
      className={`min-h-screen px-4 transition-colors duration-300 sm:px-6 ${
        isStudying
          ? "flex items-center justify-center bg-[var(--surface-0)] py-6 sm:py-10"
          : "bg-[var(--surface-0)] pb-24 pt-4 sm:pb-10 sm:pt-5"
      }`}
    >
      <div className={`mx-auto w-full transition-[max-width,opacity,transform] duration-300 ease-out ${isStudying ? "max-w-4xl" : "max-w-5xl"}`}>
        {!isStudying && activeTab === "learn" && (
          <header className="soft-enter relative mx-auto max-w-4xl overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--surface-1)] p-5 shadow-[0_22px_70px_-55px_rgba(0,0,0,0.9)] sm:p-6">
          <div className="absolute -right-28 -top-32 h-52 w-52 rounded-full bg-[#00f2ff]/[0.055] blur-[74px]" />
          <div className="absolute -bottom-24 left-8 h-32 w-32 rounded-full bg-yellow-500/[0.07] blur-[66px]" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#00f2ff]">
              ENGLISH AI STUDY
            </p>
            <h1 className="mt-2.5 text-3xl font-black tracking-tight text-white sm:text-[2.35rem]">
              Tu siguiente paso.
            </h1>
            <p className="mt-1.5 text-sm font-semibold leading-6 text-yellow-300 sm:text-[0.95rem]">
              Una frase.
              <br />
              Una decisión.
              <br />
              Sin saturarte.
            </p>
          </div>
          <button
            className="soft-layer relative mt-6 min-h-[3.25rem] w-full rounded-[var(--radius-button)] bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-500 px-7 py-3 text-base font-black tracking-tight text-black shadow-[0_10px_28px_-16px_rgba(234,179,8,0.72)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-18px_rgba(234,179,8,0.82)] active:scale-[0.99] sm:w-auto"
            onClick={startTrainingSession}
            type="button"
          >
            Continuar mi camino
          </button>
          <div className="relative mt-4 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface-2)]/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Marcador tranquilo
                </p>
              </div>
              <p className="text-xl font-black tracking-tight text-[#00f2ff]">
                {stats.totalProgress}%
              </p>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <CompactStat label="Dominadas" value={stats.learnedPhraseCount} />
              <CompactStat label="Por reforzar" value={reinforcementCount} />
              <CompactStat label="Racha" value={`${stats.streak} días`} />
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#00f2ff] shadow-[0_0_10px_rgba(0,242,255,0.28)] transition-[width] duration-300 ease-out"
                style={{ width: `${stats.totalProgress}%` }}
              />
            </div>
          </div>
          </header>
        )}

        {!isStudying && (
          <nav className="fixed bottom-5 left-5 right-5 z-20 mx-auto max-w-5xl rounded-full border border-[var(--border-soft)] bg-[var(--surface-2)]/85 p-1.5 shadow-[0_18px_54px_-38px_rgba(0,0,0,0.95)] backdrop-blur-sm">
          <div className="grid grid-cols-3 gap-1">
            {tabs.map((tab) => (
              <button
                className={`soft-layer min-h-12 rounded-full px-3 py-2 text-sm font-bold ${
                  activeTab === tab.key
                    ? "bg-[#00f2ff] text-black shadow-[0_0_16px_rgba(0,242,255,0.35)]"
                    : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
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
        )}

        <div className={`${isStudying ? "space-y-6" : "mt-6 space-y-8"}`}>
          {activeTab === "learn" && (
            <section className="space-y-8">
              {!currentSession && !dailyLesson && !isDayFinished && isStudying && dailyLearnedLessonIds.length > 0 && (
                <DailyContinuePanel
                  learnedCount={dailyLearnedLessonIds.length}
                  onContinue={continueDailyPath}
                  onFinish={finishDay}
                />
              )}

              {!currentSession && !dailyLesson && !isDayFinished && isStudying && dailyLearnedLessonIds.length === 0 && (
                <NoMoreDailyLessonsCard onFinish={finishDay} />
              )}

              {!currentSession && dailyLesson && !isDayFinished && (
                <>
                  <SessionLessonCard
                    key={`daily-${dailyLesson.id}`}
                    currentStepNumber={dailyLearnedLessonIds.length + 1}
                    lesson={dailyLesson}
                    onNeedsPractice={() => finishDailyLesson("needsPractice")}
                    onRemembered={() => finishDailyLesson("remembered")}
                    onQuestionChange={(question) =>
                      updateLessonQuestion(dailyLesson.id, question)
                    }
                    question={progress.lessonQuestions[dailyLesson.id] ?? ""}
                    showClarify
                    showReward
                    stepTitle="Frase de hoy"
                    totalSteps={dailyLearnedLessonIds.length + 1}
                  />
                  <FinishDayPanel
                    learnedCount={dailyLearnedLessonIds.length}
                    onFinish={finishDay}
                  />
                </>
              )}

              {!currentSession && !dailyLesson && !isDayFinished && !isStudying && dailyLearnedLessonIds.length > 0 && (
                <NoMoreDailyLessonsCard onFinish={finishDay} />
              )}

              {!currentSession && isDayFinished && (
                <DailyLessonClosingCard
                  learnedLessonIds={dailyLearnedLessonIds}
                  lessons={lessons}
                  onClose={resetTrainingSession}
                />
              )}

              {currentSession && currentStep && currentStep.type !== "closing" && currentSessionLesson && (
                <SessionLessonCard
                  key={`session-${currentSessionLesson.id}-${currentStepIndex}`}
                  currentStepNumber={currentStepIndex + 1}
                  lesson={currentSessionLesson}
                  onNeedsPractice={() =>
                    finishCurrentSessionStep("needsPractice")
                  }
                  onRemembered={() => finishCurrentSessionStep("remembered")}
                  stepTitle={currentStep.title}
                  totalSteps={currentSession.steps.length - 1}
                />
              )}

              {currentSession && currentStep && currentStep.type === "closing" && (
                <SessionClosingCard
                  onContinueToday={startDailyLesson}
                  session={currentSession}
                />
              )}
            </section>
          )}

          {activeTab === "library" && (
            <LibraryPanel
              getStatus={getStatus}
              lessons={lessons}
              query={libraryQuery}
              setQuery={setLibraryQuery}
            />
          )}

          {activeTab === "settings" && (
            <TeacherNotebook
              generalQuestion={progress.generalQuestion}
              onGeneralQuestionChange={updateGeneralQuestion}
              onTeacherAnswerChange={updateTeacherAnswer}
              teacherAnswer={progress.teacherAnswer}
            />
          )}
        </div>

        {!isStudying && (
          <footer className="py-4 text-center">
          <div className="relative inline-flex flex-col items-center">
            <div className="absolute top-1/2 h-8 w-44 -translate-y-1/2 rounded-full bg-[#00f2ff]/10 blur-2xl" />
            <p className="relative text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-slate-500 [text-shadow:0_0_18px_rgba(0,242,255,0.24)]">
              Built by Aster
            </p>
            <div className="relative mx-auto mt-2 h-px w-24 bg-gradient-to-r from-transparent via-[#00f2ff]/45 to-transparent shadow-[0_0_14px_rgba(0,242,255,0.24)]" />
          </div>
          </footer>
        )}
      </div>
    </main>
  );
}

function CompactStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--surface-1)] px-3 py-1.5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-base font-black tracking-tight text-slate-200">
        {value}
      </p>
    </div>
  );
}

function SessionLessonCard({
  currentStepNumber,
  lesson,
  onNeedsPractice,
  onQuestionChange,
  onRemembered,
  question = "",
  showClarify = false,
  showReward = false,
  stepTitle,
  totalSteps,
}: {
  currentStepNumber: number;
  lesson: (typeof lessons)[number];
  onNeedsPractice: () => void;
  onQuestionChange?: (question: string) => void;
  onRemembered: () => void;
  question?: string;
  showClarify?: boolean;
  showReward?: boolean;
  stepTitle: string;
  totalSteps: number;
}) {
  const [clarifyStatus, setClarifyStatus] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function handleRemembered() {
    if (!showReward) {
      onRemembered();
      return;
    }

    setSuccessMessage("Excelente. Hoy aprendiste una nueva forma de decirlo.");
    window.setTimeout(() => {
      onRemembered();
    }, 420);
  }

  async function clarifyWithTeacher() {
    const prompt = buildClarifyPrompt(lesson, question);
    const chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
    const openedWindow = window.open(chatGptUrl, "_blank", "noopener,noreferrer");

    if (openedWindow) {
      setClarifyStatus("Abrí ChatGPT con el contexto de esta frase.");
      return;
    }

    try {
      await navigator.clipboard.writeText(prompt);
      setClarifyStatus("Prompt copiado. Pégalo en ChatGPT.");
    } catch {
      setClarifyStatus("No pude abrir ChatGPT ni copiar el prompt automáticamente.");
    }
  }

  return (
    <article className="soft-enter relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--surface-1)] p-6 shadow-[0_22px_72px_-58px_rgba(0,0,0,0.95)] sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#00f2ff]/[0.055] blur-[60px]" />
      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-yellow-300">
            {stepTitle}
          </p>
          <span className="w-fit rounded-full border border-white/5 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
            {currentStepNumber} de {totalSteps}
          </span>
        </div>

        <h2 className="mt-8 max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
          {lesson.phrase}
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">
          {lesson.translation}
        </p>

        <div className="mt-8 w-fit rounded-full border border-[#00f2ff]/20 bg-[#00f2ff]/10 px-5 py-3">
          <p className="text-sm font-bold text-[#00f2ff]">
            Hoy solo recuerda esta idea
          </p>
        </div>

        <div className="mt-10 space-y-4">
          <button
            className="soft-layer min-h-14 w-full rounded-[var(--radius-button)] bg-[#00f2ff] px-4 py-3 font-black text-black shadow-[0_0_18px_rgba(0,242,255,0.24)] hover:scale-[1.01] hover:shadow-[0_0_22px_rgba(0,242,255,0.32)] active:scale-[0.99] disabled:cursor-default disabled:opacity-70"
            disabled={Boolean(successMessage)}
            onClick={handleRemembered}
            type="button"
          >
            Lo recuerdo
          </button>
          <button
            className="soft-layer min-h-12 w-full rounded-[var(--radius-button)] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3 text-sm font-bold text-slate-400 hover:scale-[1.01] hover:bg-[var(--surface-3)] hover:text-slate-200 active:scale-[0.99] disabled:cursor-default disabled:opacity-50"
            disabled={Boolean(successMessage)}
            onClick={onNeedsPractice}
            type="button"
          >
            Aún me cuesta
          </button>
        </div>

        {successMessage && (
          <div className="soft-enter mt-5 rounded-[var(--radius-card)] border border-[#00f2ff]/20 bg-[#00f2ff]/10 p-4 text-center">
            <p className="text-2xl font-black text-[#00f2ff]">✓ Muy bien</p>
            <p className="mt-2 text-sm text-slate-300">Hoy ya sabes decir:</p>
            <p className="mt-2 text-lg font-black tracking-tight text-white">
              “{lesson.phrase}”
            </p>
            <p className="mt-3 text-sm font-bold text-[#00f2ff]">
              +1 frase comprendida · Continuar →
            </p>
          </div>
        )}

        <button
          className="soft-layer mt-5 min-h-12 w-full rounded-[var(--radius-button)] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3 text-sm font-black text-slate-300 hover:border-[#00f2ff]/25 hover:bg-[var(--surface-3)] hover:text-[#00f2ff] active:scale-[0.99]"
          onClick={() => setShowHelp((current) => !current)}
          type="button"
        >
          {showHelp ? "Ocultar pista" : "Necesito una pista"}
        </button>

        {showHelp && (
          <div className="soft-enter mt-5 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface-2)] p-5">
          <p className="text-sm font-black text-slate-300">
            Pista de apoyo
            <span className="ml-2 text-xs font-semibold text-slate-500">
              mira solo lo que necesites
            </span>
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoBlock label="Pronunciación" value={lesson.pronunciation} />
            <InfoBlock label="Patrón" value={lesson.pattern} />
          </div>
          <div className="mt-4 rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--surface-1)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Explicación simple
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {lesson.explanation}
            </p>
          </div>
          {showClarify && (
            <div className="mt-4 rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--surface-1)] p-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Mi duda
                </span>
                <textarea
                  className="soft-layer mt-3 min-h-24 w-full resize-none rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--surface-0)] p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-[#00f2ff]/60 focus:shadow-[0_0_18px_rgba(0,242,255,0.1)]"
                  onChange={(event) => onQuestionChange?.(event.target.value)}
                  placeholder="Ejemplo: ¿por qué aquí se usa it is?"
                  value={question}
                />
              </label>
              <button
                className="soft-layer mt-4 min-h-12 w-full rounded-[var(--radius-button)] border border-[#00f2ff]/25 bg-[#00f2ff]/10 px-4 py-3 font-black text-[#00f2ff] hover:-translate-y-0.5 hover:bg-[#00f2ff]/15 hover:shadow-[0_0_18px_rgba(0,242,255,0.18)] active:scale-[0.99]"
                onClick={clarifyWithTeacher}
                type="button"
              >
                Resolver
              </button>
              {clarifyStatus && (
                <p className="mt-3 text-sm font-semibold text-[#00f2ff]">
                  {clarifyStatus}
                </p>
              )}
            </div>
          )}
          </div>
        )}

      </div>
    </article>
  );
}

function SessionClosingCard({
  onContinueToday,
  session,
}: {
  onContinueToday: () => void;
  session: TrainingSession;
}) {
  const lessonStepCount = session.steps.filter((step) => step.lessonId).length;

  return (
    <section className="soft-enter rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--surface-1)] p-8 text-center shadow-[0_22px_72px_-58px_rgba(0,0,0,0.95)] sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00f2ff]">
        Sesion completa
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
        Buen trabajo. Hoy avanzaste sin saturarte.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
        La app hizo un calentamiento rapido y guardo tu respuesta. Ahora sigue
        tu avance principal del dia.
      </p>
      <div className="mx-auto mt-7 max-w-sm rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface-0)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Frases vistas
        </p>
        <p className="mt-2 text-4xl font-black text-[#00f2ff]">
          {lessonStepCount}
        </p>
      </div>
      <button
        className="soft-layer mt-8 min-h-14 w-full rounded-[var(--radius-button)] bg-[#00f2ff] px-4 py-3 font-black text-black shadow-[0_0_18px_rgba(0,242,255,0.24)] hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(0,242,255,0.32)] active:scale-[0.99] sm:w-auto"
        onClick={onContinueToday}
        type="button"
      >
        Continuar mi camino
      </button>
    </section>
  );
}

function FinishDayPanel({
  learnedCount,
  onFinish,
}: {
  learnedCount: number;
  onFinish: () => void;
}) {
  return (
    <section className="soft-enter rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--surface-1)] p-6 shadow-[0_20px_62px_-54px_rgba(0,0,0,0.95)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-yellow-300">
            Control de aprendizaje
          </p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-white">
            Tú decides cuándo cerrar.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Has avanzado {learnedCount} frase{learnedCount === 1 ? "" : "s"} hoy.
            Si quieres parar, guarda tu día aquí.
          </p>
        </div>
        <button
          className="soft-layer min-h-14 rounded-[var(--radius-button)] bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-500 px-6 py-3 font-black tracking-tight text-black shadow-[0_10px_28px_-16px_rgba(234,179,8,0.72)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-18px_rgba(234,179,8,0.82)] active:scale-[0.99]"
          onClick={onFinish}
          type="button"
        >
          Listo por hoy
        </button>
      </div>
    </section>
  );
}

function DailyContinuePanel({
  learnedCount,
  onContinue,
  onFinish,
}: {
  learnedCount: number;
  onContinue: () => void;
  onFinish: () => void;
}) {
  return (
    <section className="soft-enter rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--surface-1)] p-7 text-center shadow-[0_22px_72px_-58px_rgba(0,0,0,0.95)] sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00f2ff]">
        Paso guardado
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
        Bien. Avanzaste sin saturarte.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400">
        Hoy llevas {learnedCount} frase{learnedCount === 1 ? "" : "s"} trabajada
        {learnedCount === 1 ? "" : "s"}.
      </p>
      <div className="mx-auto mt-7 flex max-w-md flex-col gap-3">
        <button
          className="soft-layer min-h-14 rounded-[var(--radius-button)] bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-500 px-6 py-3 font-black tracking-tight text-black shadow-[0_10px_28px_-16px_rgba(234,179,8,0.72)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-18px_rgba(234,179,8,0.82)] active:scale-[0.99]"
          onClick={onContinue}
          type="button"
        >
          Continuar mi camino
        </button>
        <button
          className="soft-layer min-h-12 rounded-[var(--radius-button)] border border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3 text-sm font-bold text-slate-400 hover:bg-[var(--surface-3)] hover:text-slate-200 active:scale-[0.99]"
          onClick={onFinish}
          type="button"
        >
          Listo por hoy
        </button>
      </div>
    </section>
  );
}

function NoMoreDailyLessonsCard({ onFinish }: { onFinish: () => void }) {
  return (
    <section className="soft-enter rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--surface-1)] p-8 text-center shadow-[0_22px_72px_-58px_rgba(0,0,0,0.95)] sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00f2ff]">
        Camino completo por ahora
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
        No quedan frases nuevas pendientes.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
        Puedes cerrar tu día y mantener tu control de aprendizaje.
      </p>
      <button
        className="soft-layer mt-8 min-h-14 w-full rounded-[var(--radius-button)] bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-500 px-4 py-3 font-black tracking-tight text-black shadow-[0_10px_28px_-16px_rgba(234,179,8,0.72)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-18px_rgba(234,179,8,0.82)] active:scale-[0.99] sm:w-auto"
        onClick={onFinish}
        type="button"
      >
        Listo por hoy
      </button>
    </section>
  );
}

function DailyLessonClosingCard({
  learnedLessonIds,
  lessons,
  onClose,
}: {
  learnedLessonIds: number[];
  lessons: (typeof import("@/data/lessons").lessons);
  onClose: () => void;
}) {
  const learnedLessons = learnedLessonIds
    .map((lessonId) => lessons.find((lesson) => lesson.id === lessonId))
    .filter((lesson): lesson is (typeof lessons)[number] => Boolean(lesson));

  return (
    <section className="soft-enter rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--surface-1)] p-8 text-center shadow-[0_22px_72px_-58px_rgba(0,0,0,0.95)] sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00f2ff]">
        Listo por hoy
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
        Progreso guardado.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
        Estas son las frases que trabajaste hoy. Si algo marcó dificultad,
        volverá como refuerzo dentro de Camino.
      </p>
      <div className="mx-auto mt-7 max-w-2xl space-y-3 text-left">
        {learnedLessons.length > 0 ? (
          learnedLessons.map((lesson) => (
            <article
              className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface-0)] p-4"
              key={lesson.id}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
                Día {lesson.day}
              </p>
              <p className="mt-2 font-bold text-white">{lesson.phrase}</p>
              <p className="mt-1 text-sm text-slate-400">{lesson.translation}</p>
            </article>
          ))
        ) : (
          <p className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface-0)] p-4 text-center text-sm text-slate-400">
            Hoy cerraste sin agregar frases nuevas.
          </p>
        )}
      </div>
      <button
        className="soft-layer mt-8 min-h-14 w-full rounded-[var(--radius-button)] bg-[#00f2ff] px-4 py-3 font-black text-black shadow-[0_0_18px_rgba(0,242,255,0.24)] hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(0,242,255,0.32)] active:scale-[0.99] sm:w-auto"
        onClick={onClose}
        type="button"
      >
        Volver a Camino
      </button>
    </section>
  );
}

function LibraryPanel({
  getStatus,
  lessons,
  query,
  setQuery,
}: {
  getStatus: (lessonId: number) => "known" | "review" | "new";
  lessons: (typeof import("@/data/lessons").lessons);
  query: string;
  setQuery: (query: string) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("pending");
  const [visibleCount, setVisibleCount] = useState(7);
  const cleanQuery = query.trim().toLowerCase();
  const searchedLessons = cleanQuery
    ? lessons.filter((lesson) => {
        const searchableText = [
          lesson.phrase,
          lesson.translation,
          lesson.pattern,
          lesson.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(cleanQuery);
      })
    : lessons;
  const filteredLessons = searchedLessons.filter((lesson) => {
    const status = getStatus(lesson.id);

    if (activeFilter === "known") {
      return status === "known";
    }

    if (activeFilter === "review") {
      return status === "review";
    }

    return status === "new";
  });
  const visibleLessons = filteredLessons.slice(0, visibleCount);
  const libraryFilters: {
    key: LibraryFilter;
    label: string;
    helper: string;
  }[] = [
    {
      key: "known",
      label: "Dominadas",
      helper: "Ya las recuerdas.",
    },
    {
      key: "pending",
      label: "Pendientes",
      helper: "Aun no entran al camino.",
    },
    {
      key: "review",
      label: "Repasar",
      helper: "Necesitan refuerzo.",
    },
  ];

  useEffect(() => {
    setVisibleCount(7);
  }, [activeFilter, query]);

  function countLessonsByFilter(filter: LibraryFilter) {
    return searchedLessons.filter((lesson) => {
      const status = getStatus(lesson.id);

      if (filter === "known") {
        return status === "known";
      }

      if (filter === "review") {
        return status === "review";
      }

      return status === "new";
    }).length;
  }

  return (
    <section className="space-y-8">
      <div className="soft-enter rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--surface-1)] p-8 shadow-[0_20px_62px_-54px_rgba(0,0,0,0.95)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00f2ff]">
          Biblioteca
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Consulta sin presion
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          Este espacio es solo para mirar frases y moldes. El estudio real sigue
          viviendo en Camino.
        </p>

        <label className="mt-7 block">
          <span className="text-sm font-semibold text-white">Buscar frase</span>
          <input
            className="soft-layer mt-3 min-h-14 w-full rounded-[var(--radius-input)] border border-[var(--border-soft)] bg-[var(--surface-0)] px-5 text-base text-white outline-none placeholder:text-slate-600 focus:border-[#00f2ff]/60 focus:shadow-[0_0_18px_rgba(0,242,255,0.1)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ejemplo: project, idea, necesito..."
            value={query}
          />
        </label>
      </div>

      <div className="rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--surface-1)] p-6 shadow-[0_20px_62px_-54px_rgba(0,0,0,0.95)] sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Frases
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">
              {filteredLessons.length} en {libraryFilters.find((filter) => filter.key === activeFilter)?.label.toLowerCase()}
            </h3>
          </div>
          <p className="text-sm text-slate-500">
            Solo consulta. Camino decide que estudiar.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {libraryFilters.map((filter) => {
            const isActive = activeFilter === filter.key;

            return (
              <button
                className={`soft-layer rounded-[var(--radius-card)] border p-4 text-left ${
                  isActive
                    ? "border-[#00f2ff]/35 bg-[#00f2ff]/12 shadow-[0_0_14px_rgba(0,242,255,0.16)]"
                    : "border-[var(--border-soft)] bg-[var(--surface-0)] hover:bg-[var(--surface-2)]"
                }`}
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                type="button"
              >
                <span
                  className={`text-sm font-black ${
                    isActive ? "text-[#00f2ff]" : "text-white"
                  }`}
                >
                  {filter.label}
                </span>
                <span className="mt-1 block text-2xl font-black text-white">
                  {countLessonsByFilter(filter.key)}
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {filter.helper}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          {visibleLessons.map((lesson) => (
            <article
              className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface-0)] p-5"
              key={lesson.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300">
                    Dia {lesson.day}
                  </p>
                  <p className="mt-2 font-bold text-white">{lesson.phrase}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {lesson.translation}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#00f2ff]">
                    {lesson.pattern}
                  </p>
                </div>
                <LibraryStatusPill status={getStatus(lesson.id)} />
              </div>
            </article>
          ))}
        </div>

        {visibleLessons.length === 0 && (
          <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface-0)] p-6 text-center">
            <p className="font-bold text-white">No hay frases en esta categoria.</p>
            <p className="mt-2 text-sm text-slate-500">
              Prueba otra pestaña o cambia la busqueda.
            </p>
          </div>
        )}

        {visibleCount < filteredLessons.length && (
          <div className="mt-6 text-center">
            <button
              className="soft-layer min-h-12 rounded-full border border-[#00f2ff]/25 bg-[#00f2ff]/10 px-6 text-sm font-black text-[#00f2ff] shadow-[0_0_14px_rgba(0,242,255,0.08)] hover:-translate-y-0.5 hover:border-[#00f2ff]/45 hover:shadow-[0_0_18px_rgba(0,242,255,0.16)] active:scale-[0.99]"
              onClick={() => setVisibleCount((count) => count + 7)}
              type="button"
            >
              Cargar más
            </button>
            <p className="mt-3 text-xs text-slate-500">
              Mostrando {visibleLessons.length} de {filteredLessons.length}.
            </p>
          </div>
        )}
      </div>

      <details className="rounded-[var(--radius-panel)] border border-[var(--border-soft)] bg-[var(--surface-1)] p-6 shadow-[0_20px_62px_-54px_rgba(0,0,0,0.95)] sm:p-8">
        <summary className="cursor-pointer list-none">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00f2ff]">
            Consulta secundaria
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-white">
            Mis Moldes
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ábrelo solo cuando quieras revisar patrones. Camino sigue siendo el lugar para estudiar.
          </p>
        </summary>
        <div className="mt-6">
          <PatternPanel lessons={lessons} />
        </div>
      </details>
    </section>
  );
}

function LibraryStatusPill({ status }: { status: "known" | "review" | "new" }) {
  const label =
    status === "known"
      ? "Dominada"
      : status === "review"
        ? "Por reforzar"
        : "Disponible";
  const className =
    status === "known"
      ? "border-[#00f2ff]/35 bg-[#00f2ff]/12 text-[#00f2ff] shadow-[0_0_12px_rgba(0,242,255,0.18)]"
      : status === "review"
        ? "border-orange-300/25 bg-orange-500/10 text-orange-200"
        : "border-white/5 bg-white/[0.04] text-slate-400";

  return (
    <span
      className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border-soft)] bg-[var(--surface-0)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{value}</p>
    </div>
  );
}

function buildClarifyPrompt(
  lesson: (typeof lessons)[number],
  question: string,
) {
  const cleanQuestion = question.trim();

  return `Estoy estudiando inglés desde cero con una frase diaria.

Frase: ${lesson.phrase}
Traducción: ${lesson.translation}
Pronunciación aproximada: ${lesson.pronunciation}
Patrón: ${lesson.pattern}
Explicación de la app: ${lesson.explanation}

Mi duda:
${cleanQuestion || "[escribe aquí tu duda]"}

Explícamelo con carga cognitiva mínima: sin teoría complicada, con 3 ejemplos parecidos y una forma fácil de recordarlo.`;
}
