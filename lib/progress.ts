import { lessons, type Lesson } from "@/data/lessons";

export type ReviewStatus = "known" | "review";
export type LessonLearningStatus =
  | "new"
  | "learning"
  | "needs_reinforcement"
  | "almost_known"
  | "known";

export type LessonState = {
  status: LessonLearningStatus;
  level: number;
  lastSeenAt: string | null;
  nextReviewAt: string | null;
  correctCount: number;
  struggleCount: number;
};

export type TrainingSessionStepType =
  | "warmup"
  | "reinforcement"
  | "new"
  | "closing";

export type TrainingSessionStep = {
  id: string;
  type: TrainingSessionStepType;
  title: string;
  lessonId: number | null;
};

export type TrainingSession = {
  id: string;
  createdAt: string;
  steps: TrainingSessionStep[];
};

export type SessionHistoryItem = {
  id: string;
  completedAt: string;
  lessonIds: number[];
};

export type StoredProgress = {
  knownLessonIds: number[];
  reviewLessonIds: number[];
  studiedLessonIds: number[];
  completedCheckpointIds: number[];
  checkpointMistakes: Record<number, number[]>;
  lessonQuestions: Record<number, string>;
  generalQuestion: string;
  teacherAnswer: string;
  streak: number;
  lastStudyDate: string | null;
  lessonStates?: Record<number, LessonState>;
  sessionHistory?: SessionHistoryItem[];
  lastSessionDate?: string | null;
};

export const defaultProgress: StoredProgress = {
  knownLessonIds: [],
  reviewLessonIds: [],
  studiedLessonIds: [],
  completedCheckpointIds: [],
  checkpointMistakes: {},
  lessonQuestions: {},
  generalQuestion: "",
  teacherAnswer: "",
  streak: 0,
  lastStudyDate: null,
  lessonStates: {},
  sessionHistory: [],
  lastSessionDate: null,
};

export const progressStorageKey = "english-ai-study-progress";

function normalizeIdArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  );
}

function normalizeLessonStates(value: unknown): Record<number, LessonState> {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([lessonId, state]) => {
        const numericLessonId = Number(lessonId);
        if (!Number.isInteger(numericLessonId) || numericLessonId <= 0) {
          return null;
        }

        if (!state || typeof state !== "object") {
          return null;
        }

        const partialState = state as Partial<LessonState>;
        const status = isLessonLearningStatus(partialState.status)
          ? partialState.status
          : "learning";

        return [
          numericLessonId,
          {
            status,
            level:
              typeof partialState.level === "number" ? partialState.level : 0,
            lastSeenAt:
              typeof partialState.lastSeenAt === "string"
                ? partialState.lastSeenAt
                : null,
            nextReviewAt:
              typeof partialState.nextReviewAt === "string"
                ? partialState.nextReviewAt
                : null,
            correctCount:
              typeof partialState.correctCount === "number"
                ? partialState.correctCount
                : 0,
            struggleCount:
              typeof partialState.struggleCount === "number"
                ? partialState.struggleCount
                : 0,
          },
        ];
      })
      .filter((entry): entry is [number, LessonState] => Boolean(entry)),
  );
}

function normalizeSessionHistory(value: unknown): SessionHistoryItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const partialItem = item as Partial<SessionHistoryItem>;
      if (
        typeof partialItem.id !== "string" ||
        typeof partialItem.completedAt !== "string"
      ) {
        return null;
      }

      return {
        id: partialItem.id,
        completedAt: partialItem.completedAt,
        lessonIds: normalizeIdArray(partialItem.lessonIds),
      };
    })
    .filter((item): item is SessionHistoryItem => Boolean(item));
}

function isLessonLearningStatus(
  value: unknown,
): value is LessonLearningStatus {
  return (
    value === "new" ||
    value === "learning" ||
    value === "needs_reinforcement" ||
    value === "almost_known" ||
    value === "known"
  );
}

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getPreviousDayKey(date = new Date()) {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return getTodayKey(previous);
}

export function normalizeProgress(value: Partial<StoredProgress>): StoredProgress {
  return {
    knownLessonIds: normalizeIdArray(value.knownLessonIds),
    reviewLessonIds: normalizeIdArray(value.reviewLessonIds),
    studiedLessonIds: normalizeIdArray(value.studiedLessonIds),
    completedCheckpointIds: normalizeIdArray(value.completedCheckpointIds),
    checkpointMistakes:
      value.checkpointMistakes && typeof value.checkpointMistakes === "object"
        ? value.checkpointMistakes
        : {},
    lessonQuestions:
      value.lessonQuestions && typeof value.lessonQuestions === "object"
        ? value.lessonQuestions
        : {},
    generalQuestion:
      typeof value.generalQuestion === "string" ? value.generalQuestion : "",
    teacherAnswer:
      typeof value.teacherAnswer === "string" ? value.teacherAnswer : "",
    streak: typeof value.streak === "number" ? value.streak : 0,
    lastStudyDate:
      typeof value.lastStudyDate === "string" ? value.lastStudyDate : null,
    lessonStates: normalizeLessonStates(value.lessonStates),
    sessionHistory: normalizeSessionHistory(value.sessionHistory),
    lastSessionDate:
      typeof value.lastSessionDate === "string" ? value.lastSessionDate : null,
  };
}

export function markStudyDay(progress: StoredProgress) {
  const today = getTodayKey();

  if (progress.lastStudyDate === today) {
    return progress;
  }

  const isConsecutive = progress.lastStudyDate === getPreviousDayKey();

  return {
    ...progress,
    streak: isConsecutive ? progress.streak + 1 : 1,
    lastStudyDate: today,
  };
}

export function getLessonLearningStatus(
  progress: StoredProgress,
  lessonId: number,
): LessonLearningStatus {
  const stateStatus = progress.lessonStates?.[lessonId]?.status;

  if (stateStatus) {
    return stateStatus;
  }

  if (progress.knownLessonIds.includes(lessonId)) {
    return "known";
  }

  if (progress.reviewLessonIds.includes(lessonId)) {
    return "needs_reinforcement";
  }

  if (progress.studiedLessonIds.includes(lessonId)) {
    return "learning";
  }

  return "new";
}

export function buildTrainingSession(
  progress: StoredProgress,
  availableLessons: Lesson[] = lessons,
): TrainingSession {
  const usedLessonIds = new Set<number>();
  const steps: TrainingSessionStep[] = [];
  const createdAt = new Date().toISOString();
  const sessionId = `session-${createdAt}`;
  const recentLessonIds = getRecentSessionLessonIds(progress);

  const warmupLessons = pickLessonsAvoidingRecent(
    availableLessons.filter((lesson) => progress.knownLessonIds.includes(lesson.id)),
    recentLessonIds,
    3,
  );

  const backupWarmupLessons = pickLessonsAvoidingRecent(
    availableLessons.filter(
      (lesson) =>
        progress.studiedLessonIds.includes(lesson.id) &&
        !usedLessonIds.has(lesson.id) &&
        !progress.knownLessonIds.includes(lesson.id),
    ),
    recentLessonIds,
    3 - warmupLessons.length,
  );

  [...warmupLessons, ...backupWarmupLessons].forEach((lesson, index) => {
    usedLessonIds.add(lesson.id);
    steps.push({
      id: `${sessionId}-warmup-${lesson.id}`,
      type: "warmup",
      title: index === 0 ? "Calentamiento" : "Mini evaluación",
      lessonId: lesson.id,
    });
  });

  steps.push({
    id: `${sessionId}-closing`,
    type: "closing",
    title: "Cierre",
    lessonId: null,
  });

  return {
    id: sessionId,
    createdAt,
    steps,
  };
}

export function getNextPendingLesson(
  progress: StoredProgress,
  availableLessons: Lesson[] = lessons,
) {
  return (
    availableLessons.find(
      (lesson) => !progress.studiedLessonIds.includes(lesson.id),
    ) ?? null
  );
}

export function markLessonRemembered(
  progress: StoredProgress,
  lessonId: number,
): StoredProgress {
  const numericLessonId = Number(lessonId);
  const today = getTodayKey();
  const currentState = progress.lessonStates?.[numericLessonId];
  const nextLevel = Math.min((currentState?.level ?? 0) + 1, 5);

  return markStudyDay({
    ...progress,
    studiedLessonIds: addUniqueId(progress.studiedLessonIds, numericLessonId),
    knownLessonIds: addUniqueId(progress.knownLessonIds, numericLessonId),
    reviewLessonIds: removeId(progress.reviewLessonIds, numericLessonId),
    lessonStates: {
      ...(progress.lessonStates ?? {}),
      [numericLessonId]: {
        status: "known",
        level: nextLevel,
        lastSeenAt: today,
        nextReviewAt: null,
        correctCount: (currentState?.correctCount ?? 0) + 1,
        struggleCount: currentState?.struggleCount ?? 0,
      },
    },
  });
}

export function markLessonNeedsPractice(
  progress: StoredProgress,
  lessonId: number,
): StoredProgress {
  const numericLessonId = Number(lessonId);
  const today = getTodayKey();
  const currentState = progress.lessonStates?.[numericLessonId];
  const nextLevel = Math.max((currentState?.level ?? 0) - 1, 0);

  return markStudyDay({
    ...progress,
    studiedLessonIds: addUniqueId(progress.studiedLessonIds, numericLessonId),
    knownLessonIds: removeId(progress.knownLessonIds, numericLessonId),
    reviewLessonIds: addUniqueId(progress.reviewLessonIds, numericLessonId),
    lessonStates: {
      ...(progress.lessonStates ?? {}),
      [numericLessonId]: {
        status: "needs_reinforcement",
        level: nextLevel,
        lastSeenAt: today,
        nextReviewAt: today,
        correctCount: currentState?.correctCount ?? 0,
        struggleCount: (currentState?.struggleCount ?? 0) + 1,
      },
    },
  });
}

export function completeTrainingSession(
  progress: StoredProgress,
  session: TrainingSession,
): StoredProgress {
  const completedAt = new Date().toISOString();
  const lessonIds = session.steps.flatMap((step) =>
    step.lessonId === null ? [] : [step.lessonId],
  );

  return markStudyDay({
    ...progress,
    sessionHistory: [
      ...(progress.sessionHistory ?? []),
      {
        id: session.id,
        completedAt,
        lessonIds,
      },
    ],
    lastSessionDate: getTodayKey(),
  });
}

function addUniqueId(ids: number[], lessonId: number) {
  return Array.from(new Set([...ids, lessonId]));
}

function removeId(ids: number[], lessonId: number) {
  return ids.filter((id) => id !== lessonId);
}

function getRecentSessionLessonIds(progress: StoredProgress) {
  return new Set(
    (progress.sessionHistory ?? [])
      .slice(-3)
      .flatMap((session) => session.lessonIds),
  );
}

function pickLessonsAvoidingRecent(
  candidates: Lesson[],
  recentLessonIds: Set<number>,
  count: number,
) {
  if (count <= 0) {
    return [];
  }

  const freshCandidates = candidates.filter(
    (lesson) => !recentLessonIds.has(lesson.id),
  );
  const fallbackCandidates = candidates.filter((lesson) =>
    recentLessonIds.has(lesson.id),
  );

  return [...freshCandidates, ...fallbackCandidates].slice(0, count);
}

export function getProgressStats(progress: StoredProgress) {
  const learnedLessons = lessons.filter((lesson) =>
    progress.knownLessonIds.includes(lesson.id),
  );
  const learnedWords = new Set(
    learnedLessons.flatMap((lesson) => lesson.words.map((word) => word.word)),
  );

  return {
    learnedPhraseCount: learnedLessons.length,
    learnedWordCount: learnedWords.size,
    totalLessons: lessons.length,
    totalProgress:
      lessons.length === 0
        ? 0
        : Math.round((learnedLessons.length / lessons.length) * 100),
    streak: progress.streak,
  };
}
