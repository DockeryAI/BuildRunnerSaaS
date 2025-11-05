'use client'

import { useState, useEffect } from 'react'
import { User, MapPin, Calendar, Users, Settings, Shield, Mail, Phone, Camera, Edit3, Save, X } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  phoneNumber?: string
  profileImageUrl?: string
  bio?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  vehicleInfo?: {
    make: string
    model: string
    year: number
    licensePlate: string
    color: string
  }
  offRoadExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  preferredRoles: string[]
  dietaryRestrictions: string[]
  medicalConditions?: string
  location?: {
    city: string
    state: string
    country: string
  }
  joinedAt: string
  lastActive: string
  isVerified: boolean
  privacySettings: {
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
    showVehicle: boolean
  }
  tripStats: {
    tripsCompleted: number
    tripsOrganized: number
    favoriteLocations: string[]
    totalMiles: number
  }
}

interface UserProfileProps {
  userId?: string
  onProfileUpdate?: (profile: UserProfile) => void
  isEditable?: boolean
}

export function UserProfile({
  userId = 'user-123',
  onProfileUpdate = () => console.log('Profile updated'),
  isEditable = true
}: UserProfileProps = {}) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile)
  const [activeTab, setActiveTab] = useState<'profile' | 'vehicle' | 'privacy' | 'stats'>('profile')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Simulate loading user profile
    setIsLoading(true)
    setTimeout(() => {
      setProfile(DEFAULT_PROFILE)
      setEditedProfile(DEFAULT_PROFILE)
      setIsLoading(false)
    }, 1000)
  }, [userId])

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProfile(editedProfile)
      onProfileUpdate(editedProfile)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const updateEditedProfile = (updates: Partial<UserProfile>) => {
    setEditedProfile(prev => ({ ...prev, ...updates }))
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="min-h-screen bg-[#ffffff] font-medium">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#228b22] to-[#32cd32] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
            {isEditable && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200 disabled:opacity-50"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                {profile.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt={profile.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={32} />
                )}
              </div>
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#f97316] rounded-full flex items-center justify-center hover:bg-[#ea580c] transition-colors duration-200">
                  <Camera size={14} />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile.displayName}</h2>
              <p className="text-white/80">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  profile.offRoadExperience === 'expert' ? 'bg-[#f97316]' :
                  profile.offRoadExperience === 'advanced' ? 'bg-yellow-500' :
                  profile.offRoadExperience === 'intermediate' ? 'bg-[rgb(34, 139, 34)]' :
                  'bg-[rgb(255, 255, 255)]0'
                }`}>
                  {profile.offRoadExperience.charAt(0).toUpperCase() + profile.offRoadExperience.slice(1)}
                </span>
                {profile.isVerified && (
                  <Shield size={16} className="text-white/80" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-[#e2e8f0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'vehicle', label: 'Vehicle', icon: MapPin },
              { id: 'privacy', label: 'Privacy', icon: Shield },
              { id: 'stats', label: 'Stats', icon: Calendar }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#228b22] text-[#228b22]'
                    : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl mx-auto p-6">
        {activeTab === 'profile' && (
          <ProfileTab
            profile={isEditing ? editedProfile : profile}
            isEditing={isEditing}
            onUpdate={updateEditedProfile}
          />
        )}
        {activeTab === 'vehicle' && (
          <VehicleTab
            profile={isEditing ? editedProfile : profile}
            isEditing={isEditing}
            onUpdate={updateEditedProfile}
          />
        )}
        {activeTab === 'privacy' && (
          <PrivacyTab
            profile={isEditing ? editedProfile : profile}
            isEditing={isEditing}
            onUpdate={updateEditedProfile}
          />
        )}
        {activeTab === 'stats' && (
          <StatsTab profile={profile} />
        )}
      </div>
    </div>
  )
}

function ProfileTab({ profile, isEditing, onUpdate }: {
  profile: UserProfile
  isEditing: boolean
  onUpdate: (updates: Partial<UserProfile>) => void
}) {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-md">
        <h3 className="text-lg font-bold text-[#0f172a] mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#64748b] mb-2">First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => onUpdate({ firstName: e.target.value })}
                className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
              />
            ) : (
              <p className="text-[#0f172a]">{profile.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#64748b] mb-2">Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => onUpdate({ lastName: e.target.value })}
                className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
              />
            ) : (
              <p className="text-[#0f172a]">{profile.lastName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#64748b] mb-2">Display Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => onUpdate({ displayName: e.target.value })}
                className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
              />
            ) : (
              <p className="text-[#0f172a]">{profile.displayName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#64748b] mb-2">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phoneNumber || ''}
                onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
              />
            ) : (
              <p className="text-[#0f172a]">{profile.phoneNumber || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Experience & Preferences */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-md">
        <h3 className="text-lg font-bold text-[#0f172a] mb-4">Experience & Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#64748b] mb-2">Off-Road Experience</label>
            {isEditing ? (
              <select
                value={profile.offRoadExperience}
                onChange={(e) => onUpdate({ offRoadExperience: e.target.value as any })}
                className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            ) : (
              <p className="text-[#0f172a] capitalize">{profile.offRoadExperience}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#64748b] mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={profile.bio || ''}
                onChange={(e) => onUpdate({ bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-[#0f172a]">{profile.bio || 'No bio provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-md">
        <h3 className="text-lg font-bold text-[#0f172a] mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#64748b] mb-2">Contact Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.emergencyContactName || ''}
                onChange={(e) => onUpdate({ emergencyContactName: e.target.value })}
                className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
              />
            ) : (
              <p className="text-[#0f172a]">{profile.emergencyContactName || 'Not provided'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#64748b] mb-2">Contact Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.emergencyContactPhone || ''}
                onChange={(e) => onUpdate({ emergencyContactPhone: e.target.value })}
                className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
              />
            ) : (
              <p className="text-[#0f172a]">{profile.emergencyContactPhone || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function VehicleTab({ profile, isEditing, onUpdate }: {
  profile: UserProfile
  isEditing: boolean
  onUpdate: (updates: Partial<UserProfile>) => void
}) {
  const updateVehicle = (updates: Partial<UserProfile['vehicleInfo']>) => {
    onUpdate({
      vehicleInfo: { ...profile.vehicleInfo, ...updates } as UserProfile['vehicleInfo']
    })
  }

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-md">
      <h3 className="text-lg font-bold text-[#0f172a] mb-4">Vehicle Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#64748b] mb-2">Make</label>
          {isEditing ? (
            <input
              type="text"
              value={profile.vehicleInfo?.make || ''}
              onChange={(e) => updateVehicle({ make: e.target.value })}
              className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
            />
          ) : (
            <p className="text-[#0f172a]">{profile.vehicleInfo?.make || 'Not provided'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#64748b] mb-2">Model</label>
          {isEditing ? (
            <input
              type="text"
              value={profile.vehicleInfo?.model || ''}
              onChange={(e) => updateVehicle({ model: e.target.value })}
              className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
            />
          ) : (
            <p className="text-[#0f172a]">{profile.vehicleInfo?.model || 'Not provided'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#64748b] mb-2">Year</label>
          {isEditing ? (
            <input
              type="number"
              value={profile.vehicleInfo?.year || ''}
              onChange={(e) => updateVehicle({ year: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
            />
          ) : (
            <p className="text-[#0f172a]">{profile.vehicleInfo?.year || 'Not provided'}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#64748b] mb-2">Color</label>
          {isEditing ? (
            <input
              type="text"
              value={profile.vehicleInfo?.color || ''}
              onChange={(e) => updateVehicle({ color: e.target.value })}
              className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
            />
          ) : (
            <p className="text-[#0f172a]">{profile.vehicleInfo?.color || 'Not provided'}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#64748b] mb-2">License Plate</label>
          {isEditing ? (
            <input
              type="text"
              value={profile.vehicleInfo?.licensePlate || ''}
              onChange={(e) => updateVehicle({ licensePlate: e.target.value })}
              className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
            />
          ) : (
            <p className="text-[#0f172a]">{profile.vehicleInfo?.licensePlate || 'Not provided'}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function PrivacyTab({ profile, isEditing, onUpdate }: {
  profile: UserProfile
  isEditing: boolean
  onUpdate: (updates: Partial<UserProfile>) => void
}) {
  const updatePrivacy = (key: keyof UserProfile['privacySettings'], value: boolean) => {
    onUpdate({
      privacySettings: { ...profile.privacySettings, [key]: value }
    })
  }

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-md">
      <h3 className="text-lg font-bold text-[#0f172a] mb-4">Privacy Settings</h3>
      <div className="space-y-4">
        {[
          { key: 'showEmail', label: 'Show email to group members' },
          { key: 'showPhone', label: 'Show phone number to group members' },
          { key: 'showLocation', label: 'Show location to group members' },
          { key: 'showVehicle', label: 'Show vehicle information to group members' }
        ].map(setting => (
          <div key={setting.key} className="flex items-center justify-between">
            <label className="text-[#0f172a]">{setting.label}</label>
            {isEditing ? (
              <button
                onClick={() => updatePrivacy(setting.key as any, !profile.privacySettings[setting.key as keyof typeof profile.privacySettings])}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  profile.privacySettings[setting.key as keyof typeof profile.privacySettings]
                    ? 'bg-[#228b22]'
                    : 'bg-[#e2e8f0]'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  profile.privacySettings[setting.key as keyof typeof profile.privacySettings]
                    ? 'translate-x-6'
                    : 'translate-x-0.5'
                }`} />
              </button>
            ) : (
              <span className={`px-2 py-1 rounded text-xs ${
                profile.privacySettings[setting.key as keyof typeof profile.privacySettings]
                  ? 'bg-[#228b22] text-white'
                  : 'bg-[#e2e8f0] text-[#64748b]'
              }`}>
                {profile.privacySettings[setting.key as keyof typeof profile.privacySettings] ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatsTab({ profile }: { profile: UserProfile }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 text-center shadow-md">
          <div className="text-2xl font-bold text-[#228b22]">{profile.tripStats.tripsCompleted}</div>
          <div className="text-sm text-[#64748b]">Trips Completed</div>
        </div>
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 text-center shadow-md">
          <div className="text-2xl font-bold text-[#f97316]">{profile.tripStats.tripsOrganized}</div>
          <div className="text-sm text-[#64748b]">Trips Organized</div>
        </div>
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 text-center shadow-md">
          <div className="text-2xl font-bold text-[#228b22]">{profile.tripStats.totalMiles}</div>
          <div className="text-sm text-[#64748b]">Total Miles</div>
        </div>
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 text-center shadow-md">
          <div className="text-2xl font-bold text-[#f97316]">{profile.tripStats.favoriteLocations.length}</div>
          <div className="text-sm text-[#64748b]">Favorite Spots</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-md">
        <h3 className="text-lg font-bold text-[#0f172a] mb-4">Favorite Locations</h3>
        <div className="space-y-2">
          {profile.tripStats.favoriteLocations.map((location, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-[#f8fafc] rounded-lg">
              <MapPin size={16} className="text-[#228b22]" />
              <span className="text-[#0f172a]">{location}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#ffffff] animate-pulse">
      <div className="bg-[#228b22] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-white/20 rounded w-32 mb-6" />
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full" />
            <div className="flex-1">
              <div className="h-6 bg-white/20 rounded w-48 mb-2" />
              <div className="h-4 bg-white/20 rounded w-64" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
          <div className="h-6 bg-[#f1f5f9] rounded w-32 mb-4" />
          <div className="space-y-4">
            <div className="h-4 bg-[#f1f5f9] rounded w-full" />
            <div className="h-4 bg-[#f1f5f9] rounded w-3/4" />
            <div className="h-4 bg-[#f1f5f9] rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'user-123',
  email: 'alex.trailblazer@example.com',
  firstName: 'Alex',
  lastName: 'Trailblazer',
  displayName: 'TrailMaster Alex',
  phoneNumber: '+1 (555) 123-4567',
  profileImageUrl: '',
  bio: 'Passionate off-road enthusiast with 10+ years of experience exploring the great outdoors. Love sharing adventures with fellow trail riders!',
  emergencyContactName: 'Sarah Trailblazer',
  emergencyContactPhone: '+1 (555) 987-6543',
  vehicleInfo: {
    make: 'Jeep',
    model: 'Wrangler Rubicon',
    year: 2022,
    licensePlate: 'TRAIL123',
    color: 'Forest Green'
  },
  offRoadExperience: 'advanced',
  preferredRoles: ['Navigator', 'Mechanic', 'Cook'],
  dietaryRestrictions: ['Vegetarian'],
  medicalConditions: '',
  location: {
    city: 'Denver',
    state: 'Colorado',
    country: 'USA'
  },
  joinedAt: '2023-01-15T00:00:00Z',
  lastActive: '2024-01-15T10:30:00Z',
  isVerified: true,
  privacySettings: {
    showEmail: true,
    showPhone: true,
    showLocation: true,
    showVehicle: true
  },
  tripStats: {
    tripsCompleted: 47,
    tripsOrganized: 12,
    favoriteLocations: ['Moab, Utah', 'Rubicon Trail, California', 'Black Bear Pass, Colorado'],
    totalMiles: 15420
  }
}

export default function UserProfileDemo() {
  return <UserProfile />
}