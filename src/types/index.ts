export type PromptTemplate = {
  id: string;
  title: string;
  description: string;
  category: string;
  promptText: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
  usage: number;
  rating: number;
  isPublic: boolean;
};

export type PromptResult = {
  id: string;
  originalPrompt: string;
  improvedPrompt: string;
  model: string;
  suggestions: string[];
  score: number;
  createdAt: Date;
};

export type PromptAnalysis = {
  clarity: number;
  specificity: number;
  contextCompleteness: number;
  overall: number;
  suggestions: string[];
};

export type User = {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  createdAt: Date;
};
