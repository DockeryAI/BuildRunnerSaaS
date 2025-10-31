'use client';

import React, { useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

function SectionNav({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (key: string) => void;
}) {
  const sections = [
    { key: 'executive_summary', label: 'Executive Summary' },
    { key: 'problem', label: 'Problem' },
    { key: 'audience', label: 'Audience' },
    { key: 'value_prop', label: 'Value Proposition' },
    { key: 'features', label: 'Features' },
    { key: 'monetization', label: 'Monetization' },
  ];

  return (
    <div className="flex gap-2 flex-wrap mb-4">
      {sections.map((s) => (
        <button
          key={s.key}
          onClick={() => onSelect(s.key)}
          className={`px-3 py-1 rounded border text-sm ${
            selected === s.key ? 'bg-black text-white' : 'bg-white'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function Composer({
  onSend,
  isLoading,
}: {
  onSend: (text: string) => void;
  isLoading: boolean;
}) {
  const [text, setText] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText('');
      }}
      className="flex gap-2"
    >
      <input
        className="flex-1 border rounded px-3 py-2"
        placeholder="Describe what you want to add to this section…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
      >
        {isLoading ? 'Thinking…' : 'Add'}
      </button>
    </form>
  );
}

function ChatView({ messages }: { messages: Message[] }) {
  return (
    <div className="space-y-2">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`p-3 rounded border ${
            m.role === 'user' ? 'bg-white' : 'bg-gray-50'
          }`}
        >
          <div className="text-xs opacity-60 mb-1">{m.role}</div>
          <div className="whitespace-pre-wrap">{m.content}</div>
        </div>
      ))}
    </div>
  );
}

function SectionPanel({ section }: { section: string }) {
  const labels: Record<string, string> = {
    executive_summary: 'Executive Summary',
    problem: 'Problem Statement',
    audience: 'Target Audience',
    value_prop: 'Value Proposition',
    features: 'Features & Acceptance Criteria',
    monetization: 'Monetization & Packaging',
  };
  return (
    <div className="p-4 border rounded">
      <h2 className="font-semibold mb-2">{labels[section] ?? section}</h2>
      <p className="text-sm opacity-80">
        AI-generated content for <strong>{labels[section] ?? section}</strong>{' '}
        will appear here as you iterate.
      </p>
    </div>
  );
}

function OnboardingFlow({ onStart }: { onStart: (idea: string) => void }) {
  const [idea, setIdea] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">What do you want to build?</h1>
            <p className="text-gray-600 text-lg">
              Describe your product idea and I'll help you create a comprehensive PRD
            </p>
          </div>

          <div className="space-y-6">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g., An AI agent that follows up on leads and schedules appointments automatically..."
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900"
              autoFocus
            />

            <button
              onClick={() => idea.trim() && onStart(idea.trim())}
              disabled={!idea.trim()}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Start Building My PRD
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>I'll guide you through creating a professional Product Requirements Document</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreatePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('executive_summary');
  const [isLoading, setIsLoading] = useState(false);
  const [productIdea, setProductIdea] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(true);

  async function handleStart(idea: string) {
    setProductIdea(idea);
    setShowOnboarding(false);

    // Add initial message
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Great! I'll help you build a PRD for "${idea}". Let's start by working on each section. Select a section above and describe what you want to add.`
    };
    setMessages([welcomeMessage]);
  }

  async function handleSend(text: string) {
    setIsLoading(true);
    try {
      setMessages((prev) => [...prev, { role: 'user', content: text }]);

      // TODO: call your brainstorm/prd API here; this is a stubbed response
      const reply = `Acknowledged. I will add this to **${selectedSection}** for "${productIdea}":\n\n${text}`;
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } finally {
      setIsLoading(false);
    }
  }

  if (showOnboarding) {
    return <OnboardingFlow onStart={handleStart} />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create PRD</h1>
          <p className="text-gray-600">{productIdea}</p>
        </div>
        <button
          onClick={() => setShowOnboarding(true)}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Change Idea
        </button>
      </div>

      <SectionNav selected={selectedSection} onSelect={setSelectedSection} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionPanel section={selectedSection} />
        <div className="space-y-4">
          <ChatView messages={messages} />
          <Composer onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default CreatePage;
