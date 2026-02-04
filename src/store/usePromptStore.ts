import { create } from 'zustand';
import { PromptTemplate, PromptResult } from '@/types';

interface PromptStore {
  templates: PromptTemplate[];
  history: PromptResult[];
  currentTemplate: PromptTemplate | null;
  
  addTemplate: (template: PromptTemplate) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, template: Partial<PromptTemplate>) => void;
  setCurrentTemplate: (template: PromptTemplate | null) => void;
  
  addToHistory: (result: PromptResult) => void;
  clearHistory: () => void;
  getHistory: () => PromptResult[];
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  templates: [],
  history: [],
  currentTemplate: null,

  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template],
  })),

  removeTemplate: (id) => set((state) => ({
    templates: state.templates.filter((t) => t.id !== id),
  })),

  updateTemplate: (id, updates) => set((state) => ({
    templates: state.templates.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    ),
  })),

  setCurrentTemplate: (template) => set({ currentTemplate: template }),

  addToHistory: (result) => set((state) => ({
    history: [result, ...state.history].slice(0, 100),
  })),

  clearHistory: () => set({ history: [] }),

  getHistory: () => get().history,
}));
