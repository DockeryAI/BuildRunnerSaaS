'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Target, 
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  X,
  Clock,
  Star,
  ArrowRight,
  Brain,
  Zap,
  Award,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface Recommendation {
  id: string;
  type: 'next_step' | 'template' | 'learning_resource' | 'collaboration' | 'skill_development' | 'project_idea' | 'optimization' | 'best_practice';
  content: {
    title: string;
    description: string;
    url?: string;
    metadata?: any;
  };
  score: number;
  confidence: number;
  reasoning: string;
  clicked: boolean;
  dismissed: boolean;
  created_at: string;
}

const typeIcons = {
  next_step: ArrowRight,
  template: BookOpen,
  learning_resource: Brain,
  collaboration: Users,
  skill_development: Target,
  project_idea: Lightbulb,
  optimization: Zap,
  best_practice: Award,
};

const typeColors = {
  next_step: 'bg-blue-100 text-blue-800 border-blue-200',
  template: 'bg-green-100 text-green-800 border-green-200',
  learning_resource: 'bg-purple-100 text-purple-800 border-purple-200',
  collaboration: 'bg-orange-100 text-orange-800 border-orange-200',
  skill_development: 'bg-red-100 text-red-800 border-red-200',
  project_idea: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  optimization: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  best_practice: 'bg-pink-100 text-pink-800 border-pink-200',
};

const typeLabels = {
  next_step: 'Next Step',
  template: 'Template',
  learning_resource: 'Learning',
  collaboration: 'Collaboration',
  skill_development: 'Skill Development',
  project_idea: 'Project Idea',
  optimization: 'Optimization',
  best_practice: 'Best Practice',
};

export default function FeedPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // Load personalized recommendations
  useEffect(() => {
    loadRecommendations();
  }, [filter]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('type', filter);
      }
      
      const response = await fetch(`/api/recommendations?${params}`);
      const data = await response.json();
      
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (recommendationId: string, feedback: 'positive' | 'negative') => {
    try {
      await fetch(`/api/recommendations/${recommendationId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      
      // Track the interaction
      await fetch('/api/learning/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interaction_type: 'rate',
          entity_type: 'recommendation',
          entity_id: recommendationId,
          outcome: feedback === 'positive' ? 'success' : 'failure',
        }),
      });
      
      // Refresh recommendations
      loadRecommendations();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleDismiss = async (recommendationId: string) => {
    try {
      await fetch(`/api/recommendations/${recommendationId}/dismiss`, {
        method: 'POST',
      });
      
      // Remove from local state
      setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  const handleClick = async (recommendation: Recommendation) => {
    try {
      // Track the click
      await fetch(`/api/recommendations/${recommendation.id}/click`, {
        method: 'POST',
      });
      
      await fetch('/api/learning/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interaction_type: 'click',
          entity_type: 'recommendation',
          entity_id: recommendation.id,
          context: { type: recommendation.type },
        }),
      });
      
      // Navigate to the recommendation URL if available
      if (recommendation.content.url) {
        window.open(recommendation.content.url, '_blank');
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => 
    filter === 'all' || rec.type === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your personalized feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
                Your Personalized Feed
              </h1>
              <p className="text-gray-600 mt-2">
                Discover recommendations tailored to your learning journey and goals
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Recommendations</option>
                <option value="next_step">Next Steps</option>
                <option value="template">Templates</option>
                <option value="learning_resource">Learning Resources</option>
                <option value="collaboration">Collaborations</option>
                <option value="skill_development">Skill Development</option>
                <option value="project_idea">Project Ideas</option>
                <option value="optimization">Optimizations</option>
                <option value="best_practice">Best Practices</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Recommendations</p>
                <p className="text-2xl font-bold text-gray-900">{filteredRecommendations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredRecommendations.length > 0 
                    ? Math.round(filteredRecommendations.reduce((sum, r) => sum + r.confidence, 0) / filteredRecommendations.length * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredRecommendations.length > 0 ? 'Today' : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations List */}
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-600 mb-6">
              Start using BuildRunner to get personalized recommendations based on your activity.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Explore Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRecommendations.map((recommendation) => {
              const TypeIcon = typeIcons[recommendation.type];
              
              return (
                <div key={recommendation.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${typeColors[recommendation.type]}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{recommendation.content.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${typeColors[recommendation.type]}`}>
                              {typeLabels[recommendation.type]}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">
                                {Math.round(recommendation.score * 100)}% match
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-600">
                                {Math.round(recommendation.confidence * 100)}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDismiss(recommendation.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-4">{recommendation.content.description}</p>

                    {/* Reasoning */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Why this recommendation:</strong> {recommendation.reasoning}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleFeedback(recommendation.id, 'positive')}
                          className="flex items-center space-x-1 px-3 py-1 text-sm text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>Helpful</span>
                        </button>
                        <button
                          onClick={() => handleFeedback(recommendation.id, 'negative')}
                          className="flex items-center space-x-1 px-3 py-1 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span>Not helpful</span>
                        </button>
                      </div>
                      
                      {recommendation.content.url && (
                        <button
                          onClick={() => handleClick(recommendation)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <span>Explore</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Learning Insights */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Your Learning Journey</h2>
          <p className="text-blue-100 mb-6">
            BuildRunner learns from your interactions to provide better recommendations over time. 
            The more you engage, the more personalized your experience becomes.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/knowledge"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Brain className="h-5 w-5 mr-2" />
              Explore Knowledge Graph
            </Link>
            <Link
              href="/analytics/learning"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              View Learning Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
