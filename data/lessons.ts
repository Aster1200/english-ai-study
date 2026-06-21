export type LessonWord = {
  word: string;
  translation: string;
  example: string;
};

export type Lesson = {
  id: number;
  day: number;
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

export const lessons: Lesson[] = [
  {
    id: 1,
    day: 1,
    title: "Herramientas que uso",
    tags: ["IA", "herramientas", "trabajo"],
    phrase: "I use ChatGPT.",
    translation: "Yo uso ChatGPT.",
    pronunciation: "Ai ius ChatGPT.",
    explanation: "Se usa para decir que herramienta utilizas.",
    examples: [
      "I use ChatGPT to learn English.",
      "I use ChatGPT for my projects.",
    ],
    words: [
      {
        word: "use",
        translation: "usar",
        example: "I use this tool every day.",
      },
      {
        word: "learn",
        translation: "aprender",
        example: "I learn English with examples.",
      },
      {
        word: "English",
        translation: "ingles",
        example: "English helps me at work.",
      },
      {
        word: "project",
        translation: "proyecto",
        example: "This is my AI project.",
      },
      {
        word: "tool",
        translation: "herramienta",
        example: "ChatGPT is a useful tool.",
      },
    ],
    pattern: "I use + herramienta",
  },
  {
    id: 2,
    day: 2,
    title: "En que estoy trabajando",
    tags: ["IA", "proyectos", "trabajo"],
    phrase: "I am working on an AI project.",
    translation: "Estoy trabajando en un proyecto de IA.",
    pronunciation: "Ai am working on an ei-ai project.",
    explanation: "Sirve para explicar en que estas trabajando.",
    examples: ["I am working on Baby Claude.", "I am working on a website."],
    words: [
      {
        word: "working",
        translation: "trabajando",
        example: "I am working on a new idea.",
      },
      {
        word: "AI",
        translation: "inteligencia artificial",
        example: "AI can help me practice.",
      },
      {
        word: "website",
        translation: "pagina web",
        example: "I am building a website.",
      },
      {
        word: "create",
        translation: "crear",
        example: "I create digital projects.",
      },
      {
        word: "improve",
        translation: "mejorar",
        example: "I improve my English daily.",
      },
    ],
    pattern: "I am working on + proyecto",
  },
  {
    id: 3,
    day: 3,
    title: "Lo que quiero aprender",
    tags: ["aprendizaje", "metas", "ingles"],
    phrase: "I want to learn English for work.",
    translation: "Quiero aprender ingles para el trabajo.",
    pronunciation: "Ai want tu lern Inglish for work.",
    explanation: "Se usa para expresar una meta o algo que quieres lograr.",
    examples: [
      "I want to learn English for interviews.",
      "I want to learn English for my projects.",
      "I want to learn English with simple examples.",
    ],
    words: [
      {
        word: "want",
        translation: "querer",
        example: "I want to improve.",
      },
      {
        word: "for",
        translation: "para",
        example: "English is useful for work.",
      },
      {
        word: "work",
        translation: "trabajo",
        example: "I use English at work.",
      },
      {
        word: "interview",
        translation: "entrevista",
        example: "I have an interview.",
      },
      {
        word: "simple",
        translation: "sencillo",
        example: "I need simple examples.",
      },
    ],
    pattern: "I want to + verbo",
  },
  {
    id: 4,
    day: 4,
    title: "Lo que necesito",
    tags: ["trabajo", "practica", "proyectos"],
    phrase: "I need more practice.",
    translation: "Necesito mas practica.",
    pronunciation: "Ai nid mor praktis.",
    explanation: "Sirve para decir que necesitas algo para mejorar o avanzar.",
    examples: [
      "I need more practice with pronunciation.",
      "I need more examples for my project.",
      "I need help with English at work.",
    ],
    words: [
      {
        word: "need",
        translation: "necesitar",
        example: "I need help.",
      },
      {
        word: "more",
        translation: "mas",
        example: "I need more time.",
      },
      {
        word: "practice",
        translation: "practica",
        example: "Practice helps me learn.",
      },
      {
        word: "help",
        translation: "ayuda",
        example: "I need help with this phrase.",
      },
      {
        word: "pronunciation",
        translation: "pronunciacion",
        example: "Pronunciation is important.",
      },
    ],
    pattern: "I need + cosa",
  },
];
