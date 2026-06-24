import lessonData from "./lessons.json";

export type LessonWord = {
  word: string;
  translation: string;
  example: string;
};

export type Stage = {
  id: number;
  title: string;
  range: [number, number];
};

export type Lesson = {
  id: number;
  day: number;
  stageId: number;
  title: string;
  tags: string[];
  phrase: string;
  translation: string;
  pronunciation: string;
  explanation: string;
  examples: string[];
  words: LessonWord[];
  pattern: string;
};

export type CheckpointQuestion = {
  id: string;
  type: "multiple-choice";
  prompt: string;
  options: string[];
  answer: string;
  reviewLessonIds: number[];
};

export type Checkpoint = {
  id: number;
  afterLessonId: number;
  title: string;
  questions: CheckpointQuestion[];
};

export const stages = lessonData.stages as Stage[];
export const lessons = lessonData.lessons as Lesson[];
export const checkpoints = lessonData.checkpoints as Checkpoint[];
