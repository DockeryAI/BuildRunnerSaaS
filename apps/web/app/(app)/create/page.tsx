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

function CreatePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('executive_summary');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend(text: string) {
    setIsLoading(true);
    try {
      setMessages((prev) => [...prev, { role: 'user', content: text }]);

      // TODO: call your brainstorm/prd API here; this is a stubbed response
      const reply = `Acknowledged. I will add this to **${selectedSection}**:\n\n${text}`;
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Create PRD</h1>

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
