'use client';

/**
 * Design Profiles Admin Dashboard
 *
 * Manage and monitor intelligent design profiles
 */

import { useState, useEffect } from 'react';
import type { DesignProfile } from '@/lib/design-intelligence/types';

interface ProfileAnalytics extends DesignProfile {
  feedbackCount: number;
  recentAvgRating: number;
  experimentCount: number;
}

export default function DesignProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<ProfileAnalytics | null>(null);
  const [filter, setFilter] = useState<'all' | 'top' | 'new' | 'low-confidence'>('all');

  useEffect(() => {
    loadProfiles();
  }, [filter]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      // TODO: Fetch from API endpoint
      // const response = await fetch(`/api/admin/design-profiles?filter=${filter}`);
      // const data = await response.json();
      // setProfiles(data);

      // Mock data for now
      setProfiles([]);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProfiles = () => {
    switch (filter) {
      case 'top':
        return profiles.filter((p) => (p.avg_rating || 0) >= 8.0);
      case 'new':
        return profiles.filter((p) => p.is_new_type);
      case 'low-confidence':
        return profiles.filter(
          (p) =>
            (p.confidence?.colors || 0) < 0.7 ||
            (p.confidence?.typography || 0) < 0.7 ||
            (p.confidence?.layout || 0) < 0.7
        );
      default:
        return profiles;
    }
  };

  const filteredProfiles = getFilteredProfiles();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Design Profiles</h1>
        <p className="text-gray-600">
          Manage and monitor intelligent design profiles that power BuildRunner's design
          generation
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Profiles ({profiles.length})
        </button>
        <button
          onClick={() => setFilter('top')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'top'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Top Performers (8.0+)
        </button>
        <button
          onClick={() => setFilter('new')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'new'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          New Types (Review Needed)
        </button>
        <button
          onClick={() => setFilter('low-confidence')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'low-confidence'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Low Confidence (&lt;0.7)
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600 mb-1">Total Profiles</div>
          <div className="text-2xl font-bold">{profiles.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600 mb-1">Avg Rating</div>
          <div className="text-2xl font-bold">
            {profiles.length > 0
              ? (
                  profiles.reduce((sum, p) => sum + (p.avg_rating || 0), 0) / profiles.length
                ).toFixed(1)
              : '0.0'}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600 mb-1">Total Usage</div>
          <div className="text-2xl font-bold">
            {profiles.reduce((sum, p) => sum + (p.usage_count || 0), 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600 mb-1">New Types</div>
          <div className="text-2xl font-bold">
            {profiles.filter((p) => p.is_new_type).length}
          </div>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Colors
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metrics
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Loading profiles...
                </td>
              </tr>
            ) : filteredProfiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No profiles found. Profiles will be created automatically as builds are generated.
                </td>
              </tr>
            ) : (
              filteredProfiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900">
                          {profile.name || profile.category}
                        </div>
                        <div className="text-sm text-gray-500">{profile.category}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {profile.primaryPurpose} • {profile.audience.demographic} •{' '}
                          {profile.emotionalTone.personality}
                        </div>
                      </div>
                      {profile.is_new_type && (
                        <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: profile.colorScheme.primary }}
                        title={`Primary: ${profile.colorScheme.primary}`}
                      />
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: profile.colorScheme.secondary }}
                        title={`Secondary: ${profile.colorScheme.secondary}`}
                      />
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: profile.colorScheme.accent }}
                        title={`Accent: ${profile.colorScheme.accent}`}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div>
                        <span className="text-gray-500">Rating:</span>{' '}
                        <span className="font-medium">
                          {profile.avg_rating?.toFixed(1) || 'N/A'}/10
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Usage:</span>{' '}
                        <span className="font-medium">{profile.usage_count || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Feedback:</span>{' '}
                        <span className="font-medium">{profile.feedbackCount || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <ConfidenceBar
                        label="Colors"
                        value={profile.confidence?.colors || 0.5}
                      />
                      <ConfidenceBar
                        label="Typography"
                        value={profile.confidence?.typography || 0.5}
                      />
                      <ConfidenceBar
                        label="Layout"
                        value={profile.confidence?.layout || 0.5}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProfile(profile);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <ProfileDetailModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}

function ConfidenceBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  const color =
    value >= 0.8 ? 'bg-green-500' : value >= 0.6 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="text-xs text-gray-500 w-16">{label}</div>
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-full`} style={{ width: `${percentage}%` }} />
      </div>
      <div className="text-xs text-gray-600 w-10 text-right">{percentage}%</div>
    </div>
  );
}

function ProfileDetailModal({
  profile,
  onClose,
}: {
  profile: ProfileAnalytics;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{profile.name || profile.category}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Color Scheme */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Color Scheme</h3>
            <div className="grid grid-cols-3 gap-4">
              <ColorCard
                label="Primary"
                color={profile.colorScheme.primary}
                reasoning={profile.colorScheme.primaryReasoning}
              />
              <ColorCard
                label="Secondary"
                color={profile.colorScheme.secondary}
                reasoning={profile.colorScheme.secondaryReasoning}
              />
              <ColorCard
                label="Accent"
                color={profile.colorScheme.accent}
                reasoning={profile.colorScheme.accentReasoning}
              />
            </div>
          </section>

          {/* Reference Apps */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Reference Apps</h3>
            <div className="flex flex-wrap gap-2">
              {profile.referenceApps.map((app) => (
                <span
                  key={app}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {app}
                </span>
              ))}
            </div>
          </section>

          {/* Characteristics */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Characteristics</h3>
            <div className="grid grid-cols-2 gap-4">
              <CharacteristicCard label="Purpose" value={profile.primaryPurpose} />
              <CharacteristicCard
                label="Demographic"
                value={profile.audience.demographic}
              />
              <CharacteristicCard
                label="Tech Level"
                value={profile.audience.techLevel}
              />
              <CharacteristicCard
                label="Economic Level"
                value={profile.audience.economicLevel}
              />
              <CharacteristicCard
                label="Personality"
                value={profile.emotionalTone.personality}
              />
              <CharacteristicCard
                label="Energy"
                value={profile.emotionalTone.energy}
              />
              <CharacteristicCard
                label="Aesthetic"
                value={profile.visualStyle.aesthetic}
              />
              <CharacteristicCard
                label="Modernity"
                value={profile.visualStyle.modernity}
              />
            </div>
          </section>

          {/* Typography */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Typography</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Sans Serif</div>
                  <div className="font-medium">
                    {profile.typography.fontRecommendations.sans}
                  </div>
                </div>
                {profile.typography.fontRecommendations.mono && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Monospace</div>
                    <div className="font-medium">
                      {profile.typography.fontRecommendations.mono}
                    </div>
                  </div>
                )}
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Scale Approach</div>
                  <div className="text-sm">{profile.typography.scaleApproach}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ColorCard({
  label,
  color,
  reasoning,
}: {
  label: string;
  color: string;
  reasoning: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="h-24" style={{ backgroundColor: color }} />
      <div className="p-3">
        <div className="text-sm font-medium mb-1">{label}</div>
        <div className="text-xs text-gray-600 mb-2">{color}</div>
        <div className="text-xs text-gray-500">{reasoning}</div>
      </div>
    </div>
  );
}

function CharacteristicCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="font-medium capitalize">{value}</div>
    </div>
  );
}
