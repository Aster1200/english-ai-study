import { lessons } from "@/data/lessons";

export type ReviewStatus = "known" | "review";

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
