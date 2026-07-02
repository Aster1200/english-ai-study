type TeacherNotebookProps = {
  generalQuestion: string;
  teacherAnswer: string;
  onGeneralQuestionChange: (question: string) => void;
  onTeacherAnswerChange: (answer: string) => void;
};

const questionIdeas = [
  "¿Por qué aquí se usa am?",
  "¿Cómo digo estoy aprendiendo?",
  "¿Cuál es la diferencia entre use y using?",
];

export function TeacherNotebook({
  generalQuestion,
  teacherAnswer,
  onGeneralQuestionChange,
  onTeacherAnswerChange,
}: TeacherNotebookProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-7 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#00f2ff]">
          Libreta
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
          Tu espacio para pensar con calma.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Guarda una duda, una respuesta o una idea. No es tarea: es memoria para tu próximo paso.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/5 bg-[#121212] p-6 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-300">
            ¿Qué duda tienes?
          </p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-white">
            Una pregunta pequeña basta.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Si algo no quedó claro, déjalo aquí para resolverlo después sin interrumpir tu camino.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {questionIdeas.map((idea) => (
              <button
                className="rounded-full border border-yellow-300/20 bg-yellow-400/10 px-3 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-400/15"
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
            className="mt-4 min-h-40 w-full resize-none rounded-[1.25rem] border border-white/5 bg-[#050505] p-5 text-base leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-[#00f2ff]/60 focus:shadow-[0_0_24px_rgba(0,242,255,0.12)]"
            onChange={(event) => onGeneralQuestionChange(event.target.value)}
            placeholder="Ejemplo: ¿por qué aquí se usa am?"
            value={generalQuestion}
          />

          {!generalQuestion.trim() && (
            <p className="mt-3 rounded-[1rem] border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-slate-500">
              Estado vacío: aún no hay dudas guardadas. Buena señal: hoy puedes seguir ligero.
            </p>
          )}
        </div>

        <div className="rounded-[1.75rem] border border-white/5 bg-[#121212] p-6 shadow-[0_24px_80px_-55px_rgba(0,0,0,0.95)] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#00f2ff]">
            Lo que aprendí
          </p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-white">
            Tu resumen personal.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Pega aquí respuestas, ejemplos o explicaciones que sí te ayudaron.
          </p>

          <textarea
            className="mt-4 min-h-52 w-full resize-none rounded-[1.25rem] border border-white/5 bg-[#050505] p-5 text-base leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-[#00f2ff]/60 focus:shadow-[0_0_24px_rgba(0,242,255,0.12)]"
            onChange={(event) => onTeacherAnswerChange(event.target.value)}
            placeholder="Ejemplo: I am significa yo estoy / yo soy según el contexto."
            value={teacherAnswer}
          />

          {!teacherAnswer.trim() && (
            <p className="mt-3 rounded-[1rem] border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-slate-500">
              Cuando resuelvas una duda, guarda aquí la explicación en tus propias palabras.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
