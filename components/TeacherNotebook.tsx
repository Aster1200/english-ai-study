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
    <section className="space-y-8">
      <div className="rounded-[1.75rem] border border-white/5 bg-[#121212] p-7 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        <h2 className="text-xl font-bold text-white">Preguntas para mi profesor</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Guarda aqui dudas generales para tu siguiente clase.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {questionIdeas.map((idea) => (
            <button
              className="rounded-full border border-yellow-300/20 bg-yellow-400/10 px-3 py-2 text-sm text-yellow-300"
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
          className="mt-4 min-h-36 w-full resize-none rounded-[1.25rem] border border-white/5 bg-[#050505] p-5 text-base leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-[#00f2ff]/60 focus:shadow-[0_0_24px_rgba(0,242,255,0.12)]"
          onChange={(event) => onGeneralQuestionChange(event.target.value)}
          placeholder="Escribe tus preguntas para la proxima sesion..."
          value={generalQuestion}
        />
      </div>

      <div className="rounded-[1.75rem] border border-white/5 bg-[#121212] p-7 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        <h2 className="text-xl font-bold text-white">Respuestas del profesor</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Pega aqui las respuestas que quieras conservar.
        </p>
        <textarea
          className="mt-4 min-h-44 w-full resize-none rounded-[1.25rem] border border-white/5 bg-[#050505] p-5 text-base leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-[#00f2ff]/60 focus:shadow-[0_0_24px_rgba(0,242,255,0.12)]"
          onChange={(event) => onTeacherAnswerChange(event.target.value)}
          placeholder="Pega aqui respuestas, explicaciones o ejemplos..."
          value={teacherAnswer}
        />
      </div>
    </section>
  );
}
