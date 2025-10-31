'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  AtSign,
  Bold,
  Italic,
  Link,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface CommentComposerProps {
  onSubmit: (body: string, links?: Record<string, any>) => void;
  onCancel?: () => void;
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
  className?: string;
}

interface MentionSuggestion {
  id: string;
  type: 'user' | 'role' | 'team';
  display: string;
  value: string;
}

export function CommentComposer({
  onSubmit,
  onCancel,
  initialValue = '',
  placeholder = 'Write a comment...',
  submitLabel = 'Comment',
  className = '',
}: CommentComposerProps) {
  const [body, setBody] = useState(initialValue);
  const [links, setLinks] = useState<Record<string, any>>({});
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock mention suggestions - in production, these would come from API
  const mentionSuggestions: MentionSuggestion[] = [
    { id: '1', type: 'user', display: 'John Doe', value: 'johndoe' },
    { id: '2', type: 'user', display: 'Jane Smith', value: 'janesmith' },
    { id: '3', type: 'role', display: 'Project Manager', value: 'PM' },
    { id: '4', type: 'role', display: 'Tech Lead', value: 'TechLead' },
    { id: '5', type: 'role', display: 'QA Engineer', value: 'QA' },
    { id: '6', type: 'team', display: 'Frontend Team', value: 'frontend' },
    { id: '7', type: 'team', display: 'Backend Team', value: 'backend' },
  ];

  const filteredSuggestions = mentionSuggestions.filter(suggestion =>
    suggestion.display.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    suggestion.value.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [body]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setBody(value);

    // Check for mention trigger
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);
    
    if (mentionMatch) {
      setShowMentions(true);
      setMentionQuery(mentionMatch[1]);
      setMentionPosition(cursorPosition - mentionMatch[0].length);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const insertMention = (suggestion: MentionSuggestion) => {
    const beforeMention = body.substring(0, mentionPosition);
    const afterMention = body.substring(mentionPosition + mentionQuery.length + 1);
    
    let mentionText = '';
    switch (suggestion.type) {
      case 'user':
        mentionText = `@${suggestion.value}`;
        break;
      case 'role':
        mentionText = `@role:${suggestion.value}`;
        break;
      case 'team':
        mentionText = `@team:${suggestion.value}`;
        break;
    }

    const newBody = beforeMention + mentionText + ' ' + afterMention;
    setBody(newBody);
    setShowMentions(false);
    setMentionQuery('');

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = beforeMention.length + mentionText.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const addLink = (type: string, value: string) => {
    setLinks(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const removeLink = (type: string) => {
    setLinks(prev => {
      const newLinks = { ...prev };
      delete newLinks[type];
      return newLinks;
    });
  };

  const handleSubmit = async () => {
    if (!body.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(body.trim(), Object.keys(links).length > 0 ? links : undefined);
      setBody('');
      setLinks({});
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }

    if (showMentions) {
      if (e.key === 'Escape') {
        setShowMentions(false);
        setMentionQuery('');
      }
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-4 border-0 resize-none focus:outline-none focus:ring-0 rounded-t-lg min-h-[100px]"
          rows={3}
        />

        {/* Mention Suggestions */}
        {showMentions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.slice(0, 5).map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => insertMention(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    suggestion.type === 'user' ? 'bg-blue-50 text-blue-700' :
                    suggestion.type === 'role' ? 'bg-green-50 text-green-700' :
                    'bg-purple-50 text-purple-700'
                  }`}
                >
                  {suggestion.type}
                </Badge>
                <span className="font-medium">{suggestion.display}</span>
                <span className="text-gray-500 text-sm">@{suggestion.value}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Links */}
      {Object.keys(links).length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {Object.entries(links).map(([type, value]) => (
              <div
                key={type}
                className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-sm"
              >
                <Link className="h-3 w-3" />
                <span className="font-medium">{type}:</span>
                <span className="text-gray-600">{String(value)}</span>
                <button
                  onClick={() => removeLink(type)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" title="Bold">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Italic">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Mention">
            <AtSign className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Add Link"
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) {
                addLink('link', url);
              }
            }}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!body.trim() || isSubmitting}
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="px-4 pb-2 text-xs text-gray-500">
        Use @ to mention users, roles (@role:PM), or teams (@team:frontend). 
        Press Cmd+Enter to submit.
      </div>
    </div>
  );
}
