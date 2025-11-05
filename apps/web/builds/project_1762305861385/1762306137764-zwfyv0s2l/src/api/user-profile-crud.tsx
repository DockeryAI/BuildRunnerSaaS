'use client'

import { useState, useEffect } from 'react'
import { User, Edit3, Save, X, Camera, MapPin, Calendar, Users, Settings } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  bio: string
  location: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  preferences: {
    dietaryRestrictions: string[]
    vehicleType: string
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
  stats: {
    tripsCompleted: number
    tripsOrganized: number
    memberSince: string
  }
}

interface UserProfileCRUDProps {
  userId?: string
  onProfileUpdate?: (profile: UserProfile) => void
  onProfileDelete?: (userId: string) => void
}

export function UserProfileCRUD({
  userId = 'user-1',
  onProfileUpdate = () => console.log('Profile updated'),
  onProfileDelete = () => console.log('Profile deleted')
}: UserProfileCRUDProps = {}) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'emergency' | 'preferences'>('profile')

  useEffect(() => {
    // Simulate loading user profile
    setIsLoading(true)
    setTimeout(() => {
      setProfile(DEFAULT_PROFILE)
      setEditedProfile(DEFAULT_PROFILE)
      setIsLoading(false)
    }, 1000)
  }, [userId])

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProfile({ ...profile })
  }

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setProfile(editedProfile)
    setIsEditing(false)
    setIsLoading(false)
    onProfileUpdate(editedProfile)
  }

  const handleCancel = () => {
    setEditedProfile({ ...profile })
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

  const addDietaryRestriction = (restriction: string) => {
    if (restriction.trim() && !editedProfile.preferences.dietaryRestrictions.includes(restriction)) {
      setEditedProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          dietaryRestrictions: [...prev.preferences.dietaryRestrictions, restriction]
        }
      }))
    }
  }

  const removeDietaryRestriction = (restriction: string) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        dietaryRestrictions: prev.preferences.dietaryRestrictions.filter(r => r !== restriction)
      }
    }))
  }

  if (isLoading && !profile.id) {
    return (
      <div className="min-h-screen bg-[#ffffff] p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6 shadow-md">
            <div className="animate-pulse space-y-4">
              <div className="w-24 h-24 bg-[#f1f5f9] rounded-full mx-auto"></div>
              <div className="h-6 bg-[#f1f5f9] rounded w-3/4 mx-auto"></div>
              <div className="space-y-2">
                <div className="h-4 bg-[#f1f5f9] rounded"></div>
                <div className="h-4 bg-[#f1f5f9] rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ffffff] font-medium">
      {/* Header */}
      <div className="bg-[#228b22] text-[#ffffff] p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">Profile</h1>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-150"
              aria-label="Edit profile"
            >
              <Edit3 size={20} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="p-2 bg-[#f59e0b] text-[#ffffff] rounded-lg hover:bg-[#d97706] transition-colors duration-150 disabled:opacity-50"
                aria-label="Save changes"
              >
                <Save size={20} />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-150"
                aria-label="Cancel editing"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6 shadow-md">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-[#228b22] rounded-full flex items-center justify-center text-[#ffffff] text-2xl font-bold">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 p-2 bg-[#f59e0b] text-[#ffffff] rounded-full shadow-md">
                  <Camera size={16} />
                </button>
              )}
            </div>
            
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="text-xl font-semibold text-center bg-transparent border-b-2 border-[#e2e8f0] focus:border-[#228b22] outline-none w-full"
                placeholder="Your name"
              />
            ) : (
              <h2 className="text-xl font-semibold text-[#0f172a]">{profile.name}</h2>
            )}
            
            <div className="flex items-center justify-center gap-6 text-sm text-[#64748b]">
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Since {profile.stats.memberSince}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#e2e8f0]">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#228b22]">{profile.stats.tripsCompleted}</div>
                <div className="text-sm text-[#64748b]">Trips Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#228b22]">{profile.stats.tripsOrganized}</div>
                <div className="text-sm text-[#64748b]">Trips Organized</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl shadow-md overflow-hidden">
          <div className="flex">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'emergency', label: 'Emergency', icon: Users },
              { id: 'preferences', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-medium transition-colors duration-150 ${
                  activeTab === id
                    ? 'bg-[#228b22] text-[#ffffff]'
                    : 'text-[#64748b] hover:bg-[#f8fafc]'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition-colors duration-150"
                      placeholder="your.email@example.com"
                    />
                  ) : (
                    <div className="p-3 bg-[#f8fafc] rounded-lg text-[#0f172a]">{profile.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition-colors duration-150"
                      placeholder="(555) 123-4567"
                    />
                  ) : (
                    <div className="p-3 bg-[#f8fafc] rounded-lg text-[#0f172a]">{profile.phone}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition-colors duration-150"
                      placeholder="City, State"
                    />
                  ) : (
                    <div className="p-3 bg-[#f8fafc] rounded-lg text-[#0f172a]">{profile.location}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition-colors duration-150 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="p-3 bg-[#f8fafc] rounded-lg text-[#0f172a]">{profile.bio}</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'emergency' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">Emergency Contact Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.emergencyContact.name}
                      onChange={(e) => updateNestedField('emergencyContact', 'name', e.target.value)}
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition-colors duration-150"
                      placeholder="Contact name"
                    />
                  ) : (
                    <div className="p-3 bg-[#f8fafc] rounded-lg text-[#0f172a]">{profile.emergencyContact.name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">Emergency Contact Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.emergencyContact.phone}
                      onChange={(e) => updateNestedField('emergencyContact', 'phone', e.target.value)}
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition-colors duration-150"
                      placeholder="(555) 123-4567"
                    />
                  ) : (
                    <div className="p-3 bg-[#f8fafc] rounded-lg text-[#0f172a]">{profile.emergencyContact.phone}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">Relationship</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.emergencyContact.relationship}
                      onChange={(e) => updateNestedField('emergencyContact', 'relationship', e.target.value)}
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition-colors duration-150"
                      placeholder="e.g., Spouse, Parent, Friend"
                    />
                  ) : (
                    <div className="p-3 bg-[#f8fafc] rounded-lg text-[#0f172a]">{profile.emergencyContact.relationship}</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">Vehicle Type</label>
                  {isEditing ? (
                    <select
                      value={editedProfile.preferences.vehicleType}
                      onChange={(e) => updateNestedField('preferences', 'vehicleType', e.target.value)}
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition-colors duration-150"
                    >
                      <option value="SUV">SUV</option>
                      <option value="Truck">Truck</option>
                      <option value="Jeep">Jeep</option>
                      <option value="ATV">ATV</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-[#f8fafc] rounded-lg text-[#0f172a]">{profile.preferences.vehicleType}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">Experience Level</label>
                  {isEditing ? (
                    <select
                      value={editedProfile.preferences.experienceLevel}
                      onChange={(e) => updateNestedField('preferences', 'experienceLevel', e.target.value)}
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition-colors duration-150"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  ) : (
                    <div className="p-3 bg-[#f8fafc] rounded-lg text-[#0f172a] capitalize">{profile.preferences.experienceLevel}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">Dietary Restrictions</label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {editedProfile.preferences.dietaryRestrictions.map((restriction) => (
                        <span
                          key={restriction}
                          className="px-3 py-1 bg-[#228b22]/10 text-[#228b22] rounded-full text-sm border border-[#228b22]/20 flex items-center gap-2"
                        >
                          {restriction}
                          {isEditing && (
                            <button
                              onClick={() => removeDietaryRestriction(restriction)}
                              className="hover:text-[#dc2626] transition-colors duration-150"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    {isEditing && (
                      <input
                        type="text"
                        placeholder="Add dietary restriction (press Enter)"
                        className="w-full p-3 border border-[#e2e8f0] rounded-lg focus:border-[#228b22] focus:ring-1 focus:ring-[#228b22] outline-none transition-colors duration-150"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addDietaryRestriction(e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-3">Notifications</label>
                  <div className="space-y-3">
                    {[
                      { key: 'email', label: 'Email notifications' },
                      { key: 'sms', label: 'SMS notifications' },
                      { key: 'push', label: 'Push notifications' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editedProfile.preferences.notifications[key as keyof typeof editedProfile.preferences.notifications]}
                          onChange={(e) => updateNestedField('preferences', 'notifications', {
                            ...editedProfile.preferences.notifications,
                            [key]: e.target.checked
                          })}
                          disabled={!isEditing}
                          className="w-5 h-5 text-[#228b22] border-[#e2e8f0] rounded focus:ring-[#228b22] focus:ring-2"
                        />
                        <span className="text-[#0f172a]">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Account */}
        {isEditing && (
          <div className="bg-[#ffffff] border border-[#dc2626] rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold text-[#dc2626] mb-2">Danger Zone</h3>
            <p className="text-[#64748b] mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  onProfileDelete(profile.id)
                }
              }}
              className="px-4 py-2 bg-[#dc2626] text-[#ffffff] rounded-lg hover:bg-[#b91c1c] transition-colors duration-150 font-medium"
            >
              Delete Account
            </button>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#ffffff] rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#228b22] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[#0f172a] font-medium">Saving changes...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'user-1',
  name: 'Alex Trail Runner',
  email: 'alex@example.com',
  phone: '(555) 123-4567',
  bio: 'Passionate off-road enthusiast with 5+ years of experience exploring the great outdoors. Love organizing group adventures and discovering new trails.',
  location: 'Denver, CO',
  emergencyContact: {
    name: 'Sarah Trail Runner',
    phone: '(555) 987-6543',
    relationship: 'Spouse'
  },
  preferences: {
    dietaryRestrictions: ['Vegetarian', 'Nut Allergy'],
    vehicleType: 'Jeep',
    experienceLevel: 'advanced',
    notifications: {
      email: true,
      sms: true,
      push: false
    }
  },
  stats: {
    tripsCompleted: 24,
    tripsOrganized: 8,
    memberSince: '2022'
  }
}

export default function UserProfileCRUDDemo() {
  return <UserProfileCRUD />
}