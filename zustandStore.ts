import { create } from "zustand";
import { getAllTodos } from "./useFirestore";

// Get from firebase



export const useBearStore = create((set, get) => ({
  todos: new Map(),
  fetchTodosFromLocalDb: async (userId) => {
    const response = await getAllTodos(userId);
    set({ todos: await response.});
  },
  addTodo: () => set(({}) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));