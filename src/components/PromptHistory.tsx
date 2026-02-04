'use client';

import { usePromptStore } from '@/store/usePromptStore';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { copyToClipboard } from '@/lib/prompt-utils';

export function PromptHistory() {
  const { history, clearHistory } = usePromptStore();

  const handleCopy = async (text: string) => {
    try {
      await copyToClipboard(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    toast.success('History cleared');
  };

  if (history.length === 0) {
    return (
      <Card>
        <p className="text-center text-gray-500">No history yet. Start improving prompts!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Prompt History</h2>
        <Button variant="danger" size="sm" onClick={handleClearHistory}>
          <Trash2 className="w-4 h-4 mr-2" />
          Clear History
        </Button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Original</p>
                <p className="text-sm text-gray-700 line-clamp-2">{item.originalPrompt}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Improved</p>
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.improvedPrompt}</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(item.improvedPrompt)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
