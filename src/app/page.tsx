'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PromptImprover } from '@/components/PromptImprover';
import { PromptHistory } from '@/components/PromptHistory';
import { Sparkles, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthButtons } from '@/components/AuthButtons';
import { createCheckout } from '@/lib/stripe-client';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'improve' | 'history'>('improve');
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PromptCraft</h1>
            </div>
            <div className="flex items-center gap-4">
              <AuthButtons />
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Craft Perfect Prompts for AI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Elevate your AI interactions with scientifically-optimized prompts. 
              Get instant feedback, suggestions, and variations powered by OpenAI.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowLanding(false)}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Crafting Prompts
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600">
                Get detailed analysis of clarity, specificity, and context completeness with actionable suggestions.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Instant Improvements
              </h3>
              <p className="text-gray-600">
                Transform your prompts into optimized versions designed for better LLM responses.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Variations
              </h3>
              <p className="text-gray-600">
                Generate multiple prompt variations optimized for different approaches and use cases.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-gray-600">
              Built with Next.js, OpenAI, and TypeScript | Coming soon to AppSumo
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PromptCraft</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowLanding(true)}
              >
                Back to Home
              </Button>
              <AuthButtons />
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    const url = await createCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ID as string);
                    if (url) window.location.href = url;
                  } catch (err) {
                    console.error(err);
                    alert('Failed to start checkout. Ensure Stripe keys are configured.');
                  }
                }}
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setCurrentTab('improve')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                currentTab === 'improve'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Prompt Improver
            </button>
            <button
              onClick={() => setCurrentTab('history')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                currentTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              History
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'improve' && (
          <div className="max-w-3xl mx-auto">
            <PromptImprover />
          </div>
        )}

        {currentTab === 'history' && (
          <div className="max-w-3xl mx-auto">
            <PromptHistory />
          </div>
        )}
      </main>
    </div>
  );
}
