type TeacherNotebookProps = {
  generalQuestion: string;
  teacherAnswer: string;
  onGeneralQuestionChange: (question: string) => void;
  onTeacherAnswerChange: (answer: string) => void;
};

const questionIdeas = [
  "Por que aqui se usa am?",
  "Como digo estoy aprendiendo?",
  "Cual es la diferencia entre use y using?",
];

export function TeacherNotebook({
  generalQuestion,
  teacherAnswer,
  onGeneralQuestionChange,
  onTeacherAnswerChange,
}: TeacherNotebookProps) {
  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-glow backdrop-blur-md">
        <h2 className="text-xl font-bold text-white">Preguntas para mi profesor</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Guarda aqui dudas generales para tu siguiente clase.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {questionIdeas.map((idea) => (
            <button
              className="rounded-full border border-warm/20 bg-warm/10 px-3 py-2 text-sm text-warm"
              key={idea}
              onClick={() =>
                onGeneralQuestionChange(
                  generalQuestion ? `${generalQuestion}\n${idea}` : idea,
                )
              }
              type="button"
            >
              {idea}
            </button>
          ))}
        </div>
        <textarea
          className="mt-4 min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-base leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
          onChange={(event) => onGeneralQuestionChange(event.target.value)}
          placeholder="Escribe tus preguntas para la proxima sesion..."
          value={generalQuestion}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 shadow-glow backdrop-blur-md">
        <h2 className="text-xl font-bold text-white">Respuestas del profesor</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Pega aqui las respuestas que quieras conservar.
        </p>
        <textarea
          className="mt-4 min-h-44 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-base leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
          onChange={(event) => onTeacherAnswerChange(event.target.value)}
          placeholder="Pega aqui respuestas, explicaciones o ejemplos..."
          value={teacherAnswer}
        />
      </div>
    </section>
  );
}
