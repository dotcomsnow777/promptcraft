import { PromptAnalysis } from '@/types';

export async function analyzePrompt(prompt: string): Promise<PromptAnalysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze prompt');
  }

  return response.json();
}

export async function improvePrompt(prompt: string, context?: string): Promise<string> {
  const response = await fetch('/api/improve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, context }),
  });

  if (!response.ok) {
    throw new Error('Failed to improve prompt');
  }

  const data = await response.json();
  return data.improvedPrompt;
}

export async function generatePromptVariations(
  basePrompt: string,
  count: number = 3
): Promise<string[]> {
  const response = await fetch('/api/variations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: basePrompt, count }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate variations');
  }

  const data = await response.json();
  return data.variations;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadAsJSON(data: object, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
