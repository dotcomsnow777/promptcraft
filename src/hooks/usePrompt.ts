import { useCallback, useState } from 'react';

interface UsePromptAnalysisState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

export function usePromptAnalysis() {
  const [state, setState] = useState<UsePromptAnalysisState>({
    loading: false,
    error: null,
    data: null,
  });

  const analyze = useCallback(async (prompt: string) => {
    setState({ loading: true, error: null, data: null });
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze prompt');
      }

      const data = await response.json();
      setState({ loading: false, error: null, data });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState({ loading: false, error: message, data: null });
      throw error;
    }
  }, []);

  return { ...state, analyze };
}

export function usePromptImprovement() {
  const [state, setState] = useState<UsePromptAnalysisState>({
    loading: false,
    error: null,
    data: null,
  });

  const improve = useCallback(async (prompt: string, context?: string) => {
    setState({ loading: true, error: null, data: null });
    try {
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });

      if (!response.ok) {
        throw new Error('Failed to improve prompt');
      }

      const data = await response.json();
      setState({ loading: false, error: null, data });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState({ loading: false, error: message, data: null });
      throw error;
    }
  }, []);

  return { ...state, improve };
}
