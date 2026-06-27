"use client";

import { useEffect, useMemo, useState } from "react";
import { PatternPanel } from "@/components/PatternPanel";
import { StatCard } from "@/components/StatCard";
import { TeacherNotebook } from "@/components/TeacherNotebook";
import { lessons } from "@/data/lessons";
import {
  buildTrainingSession,
  completeTrainingSession,
  defaultProgress,
  getProgressStats,
  markLessonNeedsPractice,
  markLessonRemembered,
  normalizeProgress,
  progressStorageKey,
  type StoredProgress,
  type TrainingSession,
} from "@/lib/progress";

type TabKey = "learn" | "library" | "progress" | "settings";

const tabs: { key: TabKey; label: string }[] = [
  { key: "learn", label: "Camino" },
  { key: "library", label: "Biblioteca" },
  { key: "progress", label: "Progreso" },
  { key: "settings", label: "Ajustes" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("learn");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(
    null,
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
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

  function startTrainingSession() {
    setCurrentSession(buildTrainingSession(progress, lessons));
    setCurrentStepIndex(0);
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
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 pb-36 pt-6 sm:px-6 sm:pb-14 sm:pt-8">
      <div className="mx-auto max-w-5xl">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212] p-8 shadow-[0_24px_80px_-45px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-11">
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#00f2ff]/10 blur-[90px]" />
          <div className="absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-yellow-500/10 blur-[80px]" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#00f2ff] sm:text-sm">
              English AI Study
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">
              Tu coach de ingles diario
            </h1>
            <p className="mt-4 text-base font-semibold text-yellow-300">
              Entra, presiona un boton y deja que la app te guie.
            </p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">
              No tienes que decidir que estudiar. Camino mezcla una frase facil,
              una de refuerzo y una nueva cuando esten disponibles.
            </p>
          </div>
          <button
            className="relative mt-9 min-h-16 w-full rounded-[1.35rem] bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-500 px-7 py-4 text-base font-black tracking-tight text-black shadow-[0_10px_30px_-10px_rgba(234,179,8,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-12px_rgba(234,179,8,0.75)] sm:w-auto"
            onClick={startTrainingSession}
            type="button"
          >
            Continuar mi camino
          </button>
        </header>

        <section className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Progreso total" value={`${stats.totalProgress}%`} />
          <StatCard label="Frases" value={stats.learnedPhraseCount} />
          <StatCard label="Palabras" value={stats.learnedWordCount} />
          <StatCard
            accent="text-[#00f2ff]"
            label="Racha"
            value={`${stats.streak} dias`}
          />
        </section>

        <section className="mt-5 rounded-[1.5rem] border border-white/5 bg-[#121212] p-6 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-white">Avance del camino</p>
            <p className="text-sm font-bold text-[#00f2ff]">{stats.totalProgress}%</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#00f2ff] shadow-[0_0_18px_rgba(0,242,255,0.65)] transition-all"
              style={{ width: `${stats.totalProgress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Repite en voz alta. No memorices todo. Entiende una frase.
          </p>
        </section>

        <nav className="fixed bottom-5 left-5 right-5 z-20 mx-auto max-w-5xl rounded-full border border-white/10 bg-white/10 p-1.5 shadow-[0_24px_80px_-35px_rgba(0,0,0,0.95)] backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((tab) => (
              <button
                className={`min-h-12 rounded-full px-3 py-2 text-sm font-bold transition duration-300 ${
                  activeTab === tab.key
                    ? "bg-[#00f2ff] text-black shadow-[0_0_24px_rgba(0,242,255,0.65)]"
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

        <div className="mt-8 space-y-8">
          {activeTab === "learn" && (
            <section className="space-y-8">
              {!currentSession && (
                <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-8 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00f2ff]">
                    Camino
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Tu coach de ingles diario
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                    La app decide el orden por ti. Tu solo respondes si lo
                    recuerdas o si aun te cuesta.
                  </p>

                  <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <CoachMetric
                      label="Dominadas"
                      value={stats.learnedPhraseCount}
                    />
                    <CoachMetric label="Por reforzar" value={reinforcementCount} />
                    <CoachMetric label="Racha" value={`${stats.streak} dias`} />
                  </div>

                  <button
                    className="mt-8 min-h-16 w-full rounded-[1.35rem] bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-500 px-7 py-4 text-base font-black tracking-tight text-black shadow-[0_10px_30px_-10px_rgba(234,179,8,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-12px_rgba(234,179,8,0.75)] sm:w-auto"
                    onClick={startTrainingSession}
                    type="button"
                  >
                    Continuar mi camino
                  </button>
                </div>
              )}

              {currentSession && currentStep && currentStep.type !== "closing" && currentSessionLesson && (
                <SessionLessonCard
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
                  onClose={resetTrainingSession}
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

          {activeTab === "progress" && (
            <ProgressPanel
              reinforcementCount={reinforcementCount}
              stats={stats}
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

        <footer className="py-10 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
            Built by Aster
          </p>
        </footer>
      </div>
    </main>
  );
}

function CoachMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/5 bg-[#050505] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black tracking-tight text-[#00f2ff]">
        {value}
      </p>
    </div>
  );
}

function SessionLessonCard({
  currentStepNumber,
  lesson,
  onNeedsPractice,
  onRemembered,
  stepTitle,
  totalSteps,
}: {
  currentStepNumber: number;
  lesson: (typeof lessons)[number];
  onNeedsPractice: () => void;
  onRemembered: () => void;
  stepTitle: string;
  totalSteps: number;
}) {
  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212] p-8 shadow-[0_30px_100px_-55px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#00f2ff]/10 blur-[80px]" />
      <div className="relative">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-yellow-300">
            {stepTitle}
          </p>
          <span className="w-fit rounded-full border border-white/5 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-400">
            {currentStepNumber} de {totalSteps}
          </span>
        </div>

        <h2 className="mt-7 text-4xl font-black tracking-tight text-white sm:text-5xl">
          {lesson.phrase}
        </h2>
        <p className="mt-4 text-lg leading-7 text-slate-400">
          {lesson.translation}
        </p>

        <div className="mt-7 w-fit rounded-full border border-[#00f2ff]/20 bg-[#00f2ff]/10 px-5 py-3">
          <p className="text-sm font-bold text-[#00f2ff]">
            Hoy solo recuerda esta idea
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoBlock label="Pronunciacion" value={lesson.pronunciation} />
          <InfoBlock label="Patron" value={lesson.pattern} />
        </div>

        <div className="mt-6 rounded-[1.35rem] border border-white/5 bg-[#050505] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Explicacion simple
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            {lesson.explanation}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            className="min-h-14 rounded-[1.25rem] bg-[#00f2ff] px-4 py-3 font-black text-black shadow-[0_0_24px_rgba(0,242,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_34px_rgba(0,242,255,0.55)]"
            onClick={onRemembered}
            type="button"
          >
            Lo recuerdo
          </button>
          <button
            className="min-h-14 rounded-[1.25rem] border border-orange-300/25 bg-orange-500/10 px-4 py-3 font-bold text-orange-200 transition hover:bg-orange-500/15"
            onClick={onNeedsPractice}
            type="button"
          >
            Aún me cuesta
          </button>
        </div>
      </div>
    </article>
  );
}

function SessionClosingCard({
  onClose,
  session,
}: {
  onClose: () => void;
  session: TrainingSession;
}) {
  const lessonStepCount = session.steps.filter((step) => step.lessonId).length;

  return (
    <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-8 text-center shadow-[0_30px_100px_-55px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00f2ff]">
        Sesion completa
      </p>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
        Buen trabajo. Hoy avanzaste sin saturarte.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
        La app eligio por ti y guardo tu respuesta. Las frases que aun cuestan
        volveran a aparecer dentro de Camino.
      </p>
      <div className="mx-auto mt-7 max-w-sm rounded-[1.35rem] border border-white/5 bg-[#050505] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Frases vistas
        </p>
        <p className="mt-2 text-4xl font-black text-[#00f2ff]">
          {lessonStepCount}
        </p>
      </div>
      <button
        className="mt-8 min-h-14 w-full rounded-[1.25rem] bg-[#00f2ff] px-4 py-3 font-black text-black shadow-[0_0_24px_rgba(0,242,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_34px_rgba(0,242,255,0.55)] sm:w-auto"
        onClick={onClose}
        type="button"
      >
        Volver al camino
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
  const cleanQuery = query.trim().toLowerCase();
  const filteredLessons = cleanQuery
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

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-8 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-10">
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
            className="mt-3 min-h-14 w-full rounded-[1.25rem] border border-white/5 bg-[#050505] px-5 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-[#00f2ff]/60 focus:shadow-[0_0_24px_rgba(0,242,255,0.12)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ejemplo: project, idea, necesito..."
            value={query}
          />
        </label>
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-6 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Frases
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">
              {filteredLessons.length} disponibles
            </h3>
          </div>
          <p className="text-sm text-slate-500">
            Solo consulta. Camino decide que estudiar.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          {filteredLessons.slice(0, 24).map((lesson) => (
            <article
              className="rounded-[1.35rem] border border-white/5 bg-[#050505] p-5"
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

        {filteredLessons.length > 24 && (
          <p className="mt-5 text-center text-sm text-slate-500">
            Mostrando 24 resultados para mantener la vista ligera.
          </p>
        )}
      </div>

      <PatternPanel lessons={lessons} />
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
      ? "border-[#00f2ff]/40 bg-[#00f2ff]/15 text-[#00f2ff] shadow-[0_0_18px_rgba(0,242,255,0.35)]"
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

function ProgressPanel({
  reinforcementCount,
  stats,
}: {
  reinforcementCount: number;
  stats: ReturnType<typeof getProgressStats>;
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-8 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00f2ff]">
          Progreso
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Avance simple
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          Numeros tranquilos para saber que vas avanzando sin convertirlo en una
          lista pesada.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <CoachMetric label="Dominadas" value={stats.learnedPhraseCount} />
        <CoachMetric label="Por reforzar" value={reinforcementCount} />
        <CoachMetric label="Racha" value={`${stats.streak} dias`} />
        <CoachMetric label="Avance" value={`${stats.totalProgress}%`} />
      </div>

      <section className="rounded-[1.5rem] border border-white/5 bg-[#121212] p-6 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-white">Camino total</p>
          <p className="text-sm font-bold text-[#00f2ff]">
            {stats.totalProgress}%
          </p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#00f2ff] shadow-[0_0_18px_rgba(0,242,255,0.65)] transition-all"
            style={{ width: `${stats.totalProgress}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-400">
          El objetivo no es correr. Es volver manana y seguir.
        </p>
      </section>
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-white/5 bg-[#050505] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{value}</p>
    </div>
  );
}
