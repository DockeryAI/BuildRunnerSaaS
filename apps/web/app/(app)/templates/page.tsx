'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRDTemplateLibrary, PRDTemplate } from '@/components/templates/PRDTemplateLibrary';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<PRDTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (template: PRDTemplate) => {
    localStorage.setItem('selected_template', JSON.stringify(template));
    router.push('/create?template=' + template.id);
  };

  const handleFavorite = async (templateId: string) => {
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, action: 'favorite' }),
      });
      fetchTemplates();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PRDTemplateLibrary
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
        onFavorite={handleFavorite}
      />
    </div>
  );
}
