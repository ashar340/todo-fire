export type TodoMandatoryFields = { content: string; created_at, updated_at  };
export type TodoWithDueAtAndNote = TodoMandatoryFields & {
  note: string;
  due_at: Date;
};
export type TodoWithNoteOnly = Omit<TodoWithDueAtAndNote, "due_At">;
export type TodoWithDueAtOnly = Omit<TodoWithDueAtAndNote, "note">;
export type Todo = TodoWithDueAtAndNote | TodoWithNoteOnly | TodoWithDueAtOnly;
export type TodoWithId = Todo & { id: string };

