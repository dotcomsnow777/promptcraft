'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { TextArea } from './ui/textarea';
import { Card } from './ui/card';
import { usePromptImprovement } from '@/hooks/usePrompt';
import toast from 'react-hot-toast';
import { copyToClipboard } from '@/lib/prompt-utils';
import { Sparkles, Copy } from 'lucide-react';

export function PromptImprover() {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [improvedPrompt, setImprovedPrompt] = useState('');
  const { loading, error, improve } = usePromptImprovement();

  const handleImprove = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    try {
      const result = await improve(prompt, context);
      setImprovedPrompt(result.improvedPrompt);
      toast.success('Prompt improved successfully!');
    } catch (err) {
      toast.error('Failed to improve prompt');
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(improvedPrompt);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="space-y-6">
      <Card header={<h2 className="text-lg font-semibold">Original Prompt</h2>}>
        <TextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          rows={6}
        />
      </Card>

      <Card header={<h2 className="text-lg font-semibold">Context (Optional)</h2>}>
        <TextArea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Provide additional context to help improve the prompt..."
          rows={4}
        />
      </Card>

      <Button
        onClick={handleImprove}
        isLoading={loading}
        className="w-full"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Improve Prompt
      </Button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {improvedPrompt && (
        <Card
          header={
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Improved Prompt</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          }
        >
          <TextArea
            value={improvedPrompt}
            readOnly
            rows={6}
          />
        </Card>
      )}
    </div>
  );
}
