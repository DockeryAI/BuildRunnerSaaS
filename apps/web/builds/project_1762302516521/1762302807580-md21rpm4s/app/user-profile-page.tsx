'use client'

import { useState, useEffect } from 'react'
import { User, MapPin, Calendar, Users, Settings, Camera, Edit3, Save, X, Mail, Phone, Mountain } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  bio: string
  location: string
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  preferences: {
    terrain: string[]
    difficulty: string[]
    groupSize: string
  }
  stats: {
    tripsCompleted: number
    milesOffRoad: number
    favoriteTrails: number
  }
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

interface UserProfilePageProps {
  userId?: string
  onProfileUpdate?: (profile: UserProfile) => void
}

export function UserProfilePage({
  userId = 'user-1',
  onProfileUpdate = () => console.log('Profile updated')
}: UserProfilePageProps = {}) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'emergency'>('profile')

  useEffect(() => {
    // Simulate loading user profile
    setIsLoading(true)
    setTimeout(() => {
      setProfile(DEFAULT_PROFILE)
      setEditedProfile(DEFAULT_PROFILE)
      setIsLoading(false)
    }, 1000)
  }, [userId])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProfile(editedProfile)
      setIsEditing(false)
      onProfileUpdate(editedProfile)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const updateField = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedField = (parent: string, field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof UserProfile],
        [field]: value
      }
    }))
  }

  if (isLoading && !profile.id) {
    return <ProfileSkeleton />
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-gradient-to-r from-[rgb(34,139,34)] to-[rgb(46,125,50)] text-[rgb(255,255,255)] p-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-150"
              aria-label="Edit profile"
            >
              <Edit3 size={20} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-150"
                aria-label="Cancel editing"
              >
                <X size={20} />
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-150 disabled:opacity-50"
                aria-label="Save changes"
              >
                <Save size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={32} />
              )}
            </div>
            {isEditing && (
              <button className="absolute -bottom-1 -right-1 p-1.5 bg-[rgb(249,115,22)] rounded-full">
                <Camera size={14} />
              </button>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Your name"
              />
            ) : (
              <h2 className="text-lg font-semibold">{profile.name}</h2>
            )}
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={14} />
              <span className="text-sm opacity-90">{profile.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 -mt-12 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 text-center shadow-md">
            <div className="text-lg font-semibold text-[rgb(34,139,34)]">{profile.stats.tripsCompleted}</div>
            <div className="text-xs text-[rgb(100,116,139)]">Trips</div>
          </div>
          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 text-center shadow-md">
            <div className="text-lg font-semibold text-[rgb(34,139,34)]">{profile.stats.milesOffRoad}</div>
            <div className="text-xs text-[rgb(100,116,139)]">Miles</div>
          </div>
          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 text-center shadow-md">
            <div className="text-lg font-semibold text-[rgb(34,139,34)]">{profile.stats.favoriteTrails}</div>
            <div className="text-xs text-[rgb(100,116,139)]">Trails</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 mb-6">
        <div className="flex bg-[rgb(248,250,252)] rounded-lg p-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'preferences', label: 'Preferences', icon: Settings },
            { id: 'emergency', label: 'Emergency', icon: Phone }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-150 ${
                activeTab === id
                  ? 'bg-white text-[rgb(34,139,34)] shadow-sm'
                  : 'text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 pb-20">
        {activeTab === 'profile' && (
          <ProfileTab
            profile={isEditing ? editedProfile : profile}
            isEditing={isEditing}
            onUpdate={updateField}
          />
        )}
        {activeTab === 'preferences' && (
          <PreferencesTab
            preferences={isEditing ? editedProfile.preferences : profile.preferences}
            experience={isEditing ? editedProfile.experience : profile.experience}
            isEditing={isEditing}
            onUpdatePreferences={(field, value) => updateNestedField('preferences', field, value)}
            onUpdateExperience={(value) => updateField('experience', value)}
          />
        )}
        {activeTab === 'emergency' && (
          <EmergencyTab
            contact={isEditing ? editedProfile.emergencyContact : profile.emergencyContact}
            isEditing={isEditing}
            onUpdate={(field, value) => updateNestedField('emergencyContact', field, value)}
          />
        )}
      </div>
    </div>
  )
}

function ProfileTab({ profile, isEditing, onUpdate }: {
  profile: UserProfile
  isEditing: boolean
  onUpdate: (field: string, value: any) => void
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(100,116,139)] mb-2">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={profile.email}
                onChange={(e) => onUpdate('email', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              />
            ) : (
              <div className="flex items-center gap-2 text-[rgb(15,23,42)]">
                <Mail size={16} />
                <span>{profile.email}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(100,116,139)] mb-2">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => onUpdate('phone', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              />
            ) : (
              <div className="flex items-center gap-2 text-[rgb(15,23,42)]">
                <Phone size={16} />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">About</h3>
        {isEditing ? (
          <textarea
            value={profile.bio}
            onChange={(e) => onUpdate('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150 resize-none"
            placeholder="Tell us about your off-roading experience..."
          />
        ) : (
          <p className="text-[rgb(100,116,139)]">{profile.bio}</p>
        )}
      </div>
    </div>
  )
}

function PreferencesTab({ preferences, experience, isEditing, onUpdatePreferences, onUpdateExperience }: {
  preferences: UserProfile['preferences']
  experience: UserProfile['experience']
  isEditing: boolean
  onUpdatePreferences: (field: string, value: any) => void
  onUpdateExperience: (value: string) => void
}) {
  const terrainOptions = ['Desert', 'Forest', 'Mountains', 'Beach', 'Rock Crawling', 'Mud']
  const difficultyOptions = ['Easy', 'Moderate', 'Difficult', 'Extreme']
  const experienceOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ]

  const toggleTerrain = (terrain: string) => {
    const current = preferences.terrain || []
    const updated = current.includes(terrain)
      ? current.filter(t => t !== terrain)
      : [...current, terrain]
    onUpdatePreferences('terrain', updated)
  }

  const toggleDifficulty = (difficulty: string) => {
    const current = preferences.difficulty || []
    const updated = current.includes(difficulty)
      ? current.filter(d => d !== difficulty)
      : [...current, difficulty]
    onUpdatePreferences('difficulty', updated)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Experience Level</h3>
        <div className="grid grid-cols-2 gap-3">
          {experienceOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => isEditing && onUpdateExperience(value)}
              disabled={!isEditing}
              className={`p-3 rounded-lg border text-sm font-medium transition-all duration-150 ${
                experience === value
                  ? 'bg-[rgb(34,139,34)] text-white border-[rgb(34,139,34)]'
                  : 'bg-white text-[rgb(100,116,139)] border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
              } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <Mountain size={16} className="mx-auto mb-1" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Preferred Terrain</h3>
        <div className="grid grid-cols-2 gap-3">
          {terrainOptions.map((terrain) => (
            <button
              key={terrain}
              onClick={() => isEditing && toggleTerrain(terrain)}
              disabled={!isEditing}
              className={`p-3 rounded-lg border text-sm font-medium transition-all duration-150 ${
                preferences.terrain?.includes(terrain)
                  ? 'bg-[rgb(34,139,34)] text-white border-[rgb(34,139,34)]'
                  : 'bg-white text-[rgb(100,116,139)] border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
              } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {terrain}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Difficulty Preferences</h3>
        <div className="grid grid-cols-2 gap-3">
          {difficultyOptions.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => isEditing && toggleDifficulty(difficulty)}
              disabled={!isEditing}
              className={`p-3 rounded-lg border text-sm font-medium transition-all duration-150 ${
                preferences.difficulty?.includes(difficulty)
                  ? 'bg-[rgb(34,139,34)] text-white border-[rgb(34,139,34)]'
                  : 'bg-white text-[rgb(100,116,139)] border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
              } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Group Size Preference</h3>
        {isEditing ? (
          <select
            value={preferences.groupSize}
            onChange={(e) => onUpdatePreferences('groupSize', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
          >
            <option value="2-4">2-4 people</option>
            <option value="5-8">5-8 people</option>
            <option value="9-12">9-12 people</option>
            <option value="13+">13+ people</option>
          </select>
        ) : (
          <div className="flex items-center gap-2 text-[rgb(15,23,42)]">
            <Users size={16} />
            <span>{preferences.groupSize} people</span>
          </div>
        )}
      </div>
    </div>
  )
}

function EmergencyTab({ contact, isEditing, onUpdate }: {
  contact: UserProfile['emergencyContact']
  isEditing: boolean
  onUpdate: (field: string, value: any) => void
}) {
  return (
    <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Emergency Contact</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(100,116,139)] mb-2">Name</label>
          {isEditing ? (
            <input
              type="text"
              value={contact.name}
              onChange={(e) => onUpdate('name', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              placeholder="Emergency contact name"
            />
          ) : (
            <div className="text-[rgb(15,23,42)]">{contact.name}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(100,116,139)] mb-2">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => onUpdate('phone', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              placeholder="Emergency contact phone"
            />
          ) : (
            <div className="text-[rgb(15,23,42)]">{contact.phone}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(100,116,139)] mb-2">Relationship</label>
          {isEditing ? (
            <select
              value={contact.relationship}
              onChange={(e) => onUpdate('relationship', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
            >
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          ) : (
            <div className="text-[rgb(15,23,42)] capitalize">{contact.relationship}</div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] animate-pulse">
      <div className="bg-gradient-to-r from-[rgb(34,139,34)] to-[rgb(46,125,50)] p-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-20 bg-white/20 rounded"></div>
          <div className="h-8 w-8 bg-white/20 rounded-lg"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full"></div>
          <div className="flex-1">
            <div className="h-5 w-32 bg-white/20 rounded mb-2"></div>
            <div className="h-4 w-24 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
      <div className="px-6 -mt-12 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md">
              <div className="h-6 w-8 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-3 w-12 bg-gray-200 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'user-1',
  name: 'Alex Thompson',
  email: 'alex.thompson@email.com',
  phone: '+1 (555) 123-4567',
  bio: 'Passionate off-road enthusiast with 8 years of experience exploring trails across the Southwest. Love sharing adventures with fellow outdoor lovers and discovering new challenging routes.',
  location: 'Denver, CO',
  experience: 'advanced',
  preferences: {
    terrain: ['Mountains', 'Desert', 'Rock Crawling'],
    difficulty: ['Moderate', 'Difficult'],
    groupSize: '5-8'
  },
  stats: {
    tripsCompleted: 47,
    milesOffRoad: 1250,
    favoriteTrails: 12
  },
  emergencyContact: {
    name: 'Sarah Thompson',
    phone: '+1 (555) 987-6543',
    relationship: 'spouse'
  }
}

export default function UserProfilePageDemo() {
  return <UserProfilePage />
}