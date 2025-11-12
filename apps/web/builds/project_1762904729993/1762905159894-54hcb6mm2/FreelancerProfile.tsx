'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Briefcase,
  Award,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Check,
  X,
  Edit2,
  Save,
  Camera,
  Mail,
  Phone,
  Globe,
  Clock,
  Shield,
  TrendingUp,
  FileText,
  Download,
  Plus,
  Info,
  Loader2,
  AlertCircle,
  Image,
  Code,
  GraduationCap,
  Link as LinkIcon
} from 'lucide-react'

interface Skill {
  id: string
  name: string
  level: 'beginner' | 'intermediate' | 'expert'
}

interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  verified: boolean
}

interface Portfolio {
  id: string
  title: string
  description: string
  image: string
  link: string
}

interface FreelancerData {
  id: string
  name: string
  title: string
  avatar: string
  bio: string
  location: string
  hourlyRate: number
  availability: 'available' | 'busy' | 'unavailable'
  rating: number
  completedProjects: number
  memberSince: string
  email: string
  phone: string
  website: string
  skills: Skill[]
  certifications: Certification[]
  portfolio: Portfolio[]
  insuranceVerified: boolean
  backgroundChecked: boolean
}

interface FreelancerProfileProps {
  data?: FreelancerData
  onSave?: (data: FreelancerData) => void
  isLoading?: boolean
  error?: string | null
}

const DEFAULT_DATA: FreelancerData = {
  id: '1',
  name: 'Sarah Johnson',
  title: 'Full Stack Developer',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  bio: 'Experienced full stack developer specializing in React, Node.js, and cloud architecture. Passionate about building scalable applications that solve real-world problems.',
  location: 'San Francisco, CA',
  hourlyRate: 125,
  availability: 'available',
  rating: 4.9,
  completedProjects: 47,
  memberSince: 'January 2022',
  email: 'sarah.johnson@example.com',
  phone: '+1 (555) 123-4567',
  website: 'www.sarahjohnson.dev',
  skills: [
    { id: '1', name: 'React', level: 'expert' },
    { id: '2', name: 'Node.js', level: 'expert' },
    { id: '3', name: 'TypeScript', level: 'intermediate' },
    { id: '4', name: 'AWS', level: 'intermediate' }
  ],
  certifications: [
    { id: '1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023', verified: true },
    { id: '2', name: 'Google Cloud Professional', issuer: 'Google', date: '2022', verified: true }
  ],
  portfolio: [
    { id: '1', title: 'E-commerce Platform', description: 'Built a scalable e-commerce solution', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop', link: '#' },
    { id: '2', title: 'Healthcare Dashboard', description: 'Real-time analytics dashboard', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop', link: '#' }
  ],
  insuranceVerified: true,
  backgroundChecked: true
}

const levelColors = {
  expert: 'bg-primary text-primary dark:bg-primary/30 dark:text-primary',
  intermediate: 'bg-secondary text-secondary dark:bg-secondary/30 dark:text-secondary',
  beginner: 'bg-accent text-accent dark:bg-accent/30 dark:text-accent',
}

const levelProgress = {
  expert: '100%',
  intermediate: '66%',
  beginner: '33%',
}

const levelProgressColors = {
  expert: 'bg-primary',
  intermediate: 'bg-secondary',
  beginner: 'bg-accent',
}

export function FreelancerProfile({
  data = DEFAULT_DATA,
  onSave = () => console.log('Profile saved'),
  isLoading = false,
  error = null
}: FreelancerProfileProps = {}) {
  const [profileData, setProfileData] = useState<FreelancerData>(data)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'portfolio' | 'credentials'>('overview')

  useEffect(() => {
    if (data) {
      setProfileData(data)
    }
  }, [data])

  const handleSave = () => {
    onSave(profileData)
    setIsEditing(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 }
  }

  const commonTransition = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-surface font-inter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-sm p-6 mb-6 animate-pulse">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-surface dark:bg-surface"></div>
                <div>
                  <div className="h-8 bg-surface dark:bg-surface rounded w-48 mb-2"></div>
                  <div className="h-6 bg-surface dark:bg-surface rounded w-32"></div>
                </div>
              </div>
              <div className="h-10 bg-surface dark:bg-surface rounded w-32"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface dark:bg-surface rounded-lg p-4 h-24"></div>
              ))}
            </div>
          </div>
          <div className="h-10 bg-surface dark:bg-surface rounded-lg mb-6 w-full"></div>
          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-sm p-6 h-64 animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background dark:bg-surface font-inter flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 rounded-xl bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive text-center">
          <AlertCircle className="w-12 h-12 text-destructive dark:text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-destructive dark:text-destructive mb-2">Error Loading Profile</h3>
          <p className="text-destructive dark:text-destructive text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-destructive text-foreground rounded-lg font-medium hover:bg-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 transition-all duration-150"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={commonTransition}
      className="min-h-screen bg-background dark:bg-surface font-inter text-muted-foreground dark:text-muted-foreground"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 md:space-y-8">
        {/* Header Section */}
        <motion.div
          className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-sm p-6"
          whileHover={{ boxShadow: "0 16px 24px -4px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)" }}
          transition={commonTransition}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-background dark:border-border shadow-md"
                />
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-foreground rounded-full shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 transition-all duration-150"
                    aria-label="Change avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </motion.button>
                )}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background dark:border-border ${
                  profileData.availability === 'available' ? 'bg-secondary' :
                  profileData.availability === 'busy' ? 'bg-accent' : 'bg-surface'
                }`} />
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="text-2xl font-semibold bg-background dark:bg-surface border border-border dark:border-border rounded-lg px-3 py-1 mb-1 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150"
                    aria-label="Freelancer name"
                  />
                ) : (
                  <h1 className="text-2xl font-semibold text-muted-foreground dark:text-muted-foreground">{profileData.name}</h1>
                )}
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.title}
                    onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                    className="text-muted-foreground dark:text-muted-foreground bg-background dark:bg-surface border border-border dark:border-border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150"
                    aria-label="Freelancer title"
                  />
                ) : (
                  <p className="text-muted-foreground dark:text-muted-foreground">{profileData.title}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profileData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Member since {profileData.memberSince}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary text-foreground rounded-lg font-medium shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 transition-all duration-150 flex items-center gap-2"
                  aria-label="Edit profile"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="px-4 py-2 bg-secondary text-foreground rounded-lg font-medium shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 transition-all duration-150 flex items-center gap-2"
                    aria-label="Save changes"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground rounded-lg font-medium shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-muted focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 transition-all duration-150 flex items-center gap-2"
                    aria-label="Cancel editing"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <motion.div
              className="bg-background dark:bg-surface rounded-lg p-4 border border-border dark:border-border"
              whileHover={{ y: -4, boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.08)" }}
              transition={commonTransition}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">Hourly Rate</p>
                  <p className="text-2xl font-semibold text-muted-foreground dark:text-muted-foreground">${profileData.hourlyRate}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </motion.div>
            <motion.div
              className="bg-background dark:bg-surface rounded-lg p-4 border border-border dark:border-border"
              whileHover={{ y: -4, boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.08)" }}
              transition={commonTransition}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">Rating</p>
                  <p className="text-2xl font-semibold text-muted-foreground dark:text-muted-foreground flex items-center gap-1">
                    {profileData.rating} <Star className="w-5 h-5 text-accent fill-yellow-500" />
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary" />
              </div>
            </motion.div>
            <motion.div
              className="bg-background dark:bg-surface rounded-lg p-4 border border-border dark:border-border"
              whileHover={{ y: -4, boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.08)" }}
              transition={commonTransition}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">Projects</p>
                  <p className="text-2xl font-semibold text-muted-foreground dark:text-muted-foreground">{profileData.completedProjects}</p>
                </div>
                <Briefcase className="w-8 h-8 text-secondary" />
              </div>
            </motion.div>
            <motion.div
              className="bg-background dark:bg-surface rounded-lg p-4 border border-border dark:border-border"
              whileHover={{ y: -4, boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.08)" }}
              transition={commonTransition}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">Verified</p>
                  <div className="flex flex-col gap-1 mt-1">
                    {profileData.insuranceVerified && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 text-secondary dark:text-secondary"
                      >
                        <Shield className="w-4 h-4" />
                        <span className="text-xs">Insured</span>
                      </motion.div>
                    )}
                    {profileData.backgroundChecked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-1 text-secondary dark:text-secondary"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-xs">Background Checked</span>
                      </motion.div>
                    )}
                  </div>
                </div>
                <Award className="w-8 h-8 text-primary" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 p-2 bg-surface dark:bg-surface rounded-lg shadow-sm">
          {(['overview', 'skills', 'portfolio', 'credentials'] as const).map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-md font-medium capitalize transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 ${
                activeTab === tab
                  ? 'bg-background dark:bg-surface text-muted-foreground dark:text-muted-foreground shadow-sm'
                  : 'text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground'
              }`}
              aria-selected={activeTab === tab}
              role="tab"
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={commonTransition}
              className="space-y-6"
            >
              <motion.div
                className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-sm p-6"
                whileHover={{ boxShadow: "0 16px 24px -4px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)" }}
                transition={commonTransition}
              >
                <h2 className="text-lg font-semibold text-muted-foreground dark:text-muted-foreground mb-4">About</h2>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full h-32 bg-background dark:bg-surface border border-border dark:border-border rounded-lg px-4 py-3 text-muted-foreground dark:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all duration-150"
                    aria-label="Freelancer biography"
                  />
                ) : (
                  <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">{profileData.bio}</p>
                )}
              </motion.div>

              <motion.div
                className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-sm p-6"
                whileHover={{ boxShadow: "0 16px 24px -4px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)" }}
                transition={commonTransition}
              >
                <h2 className="text-lg font-semibold text-muted-foreground dark:text-muted-foreground mb-4">Contact Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="flex-1 bg-background dark:bg-surface border border-border dark:border-border rounded-lg px-3 py-2 text-muted-foreground dark:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150"
                        aria-label="Freelancer email"
                      />
                    ) : (
                      <a href={`mailto:${profileData.email}`} className="text-primary hover:underline hover:text-primary dark:hover:text-primary transition-colors duration-150">
                        {profileData.email}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="flex-1 bg-background dark:bg-surface border border-border dark:border-border rounded-lg px-3 py-2 text-muted-foreground dark:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150"
                        aria-label="Freelancer phone number"
                      />
                    ) : (
                      <span className="text-muted-foreground dark:text-muted-foreground">{profileData.phone}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
                    {isEditing ? (
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        className="flex-1 bg-background dark:bg-surface border border-border dark:border-border rounded-lg px-3 py-2 text-muted-foreground dark:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-150"
                        aria-label="Freelancer website"
                      />
                    ) : (
                      <a href={`https://${profileData.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-primary dark:hover:text-primary transition-colors duration-150">
                        {profileData.website}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={commonTransition}
              className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-muted-foreground dark:text-muted-foreground">Skills & Expertise</h2>
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 bg-primary text-foreground rounded-lg text-sm font-medium flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 transition-all duration-150"
                    aria-label="Add new skill"
                  >
                    <Plus className="w-4 h-4" />
                    Add Skill
                  </motion.button>
                )}
              </div>
              {profileData.skills.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Code className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground dark:text-muted-foreground mb-2">No skills added yet</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground text-sm">Get started by adding your key skills.</p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {profileData.skills.map((skill) => (
                    <motion.div
                      key={skill.id}
                      variants={itemVariants}
                      whileHover={{ x: 4, boxShadow: "0 4px 8px -2px rgba(0, 0, 0, 0.05)" }}
                      transition={commonTransition}
                      className="bg-background dark:bg-surface rounded-lg p-4 border border-border dark:border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-muted-foreground dark:text-muted-foreground">{skill.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColors[skill.level]}`}>
                          {skill.level}
                        </span>
                      </div>
                      <div className="w-full bg-surface dark:bg-surface rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: levelProgress[skill.level] }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className={`h-2 rounded-full ${levelProgressColors[skill.level]}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={commonTransition}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-muted-foreground dark:text-muted-foreground">Portfolio</h2>
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 bg-primary text-foreground rounded-lg text-sm font-medium flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 transition-all duration-150"
                    aria-label="Add new project"
                  >
                    <Plus className="w-4 h-4" />
                    Add Project
                  </motion.button>
                )}
              </div>
              {profileData.portfolio.length === 0 ? (
                <div className="text-center py-12 bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-sm">
                  <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground dark:text-muted-foreground mb-2">No portfolio items yet</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground text-sm">Showcase your best work by adding projects.</p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {profileData.portfolio.map((project) => (
                    <motion.div
                      key={project.id}
                      variants={itemVariants}
                      whileHover={{ y: -4, boxShadow: "0 16px 24px -4px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)" }}
                      transition={commonTransition}
                      className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-sm overflow-hidden"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end p-4">
                          <motion.a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 bg-primary text-foreground rounded-lg text-sm font-medium flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 transition-all duration-150"
                            aria-label={`View project ${project.title}`}
                          >
                            <LinkIcon className="w-4 h-4" />
                            View Project
                          </motion.a>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-muted-foreground dark:text-muted-foreground mb-1">{project.title}</h3>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">{project.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'credentials' && (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={commonTransition}
              className="space-y-6"
            >
              <motion.div
                className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-sm p-6"
                whileHover={{ boxShadow: "0 16px 24px -4px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)" }}
                transition={commonTransition}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-muted-foreground dark:text-muted-foreground">Certifications</h2>
                  {isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1.5 bg-primary text-foreground rounded-lg text-sm font-medium flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 transition-all duration-150"
                      aria-label="Add new certification"
                    >
                      <Plus className="w-4 h-4" />
                      Add Certification
                    </motion.button>
                  )}
                </div>
                {profileData.certifications.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-muted-foreground dark:text-muted-foreground mb-2">No certifications added yet</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground text-sm">Boost your credibility with certifications.</p>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                  >
                    {profileData.certifications.map((cert) => (
                      <motion.div
                        key={cert.id}
                        variants={itemVariants}
                        whileHover={{ x: 4, boxShadow: "0 4px 8px -2px rgba(0, 0, 0, 0.05)" }}
                        transition={commonTransition}
                        className="flex items-center justify-between p-4 bg-background dark:bg-surface rounded-lg border border-border dark:border-border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary dark:bg-primary/30 rounded-lg">
                            <Award className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-muted-foreground dark:text-muted-foreground">{cert.name}</h3>
                            <p className="text-sm text-muted-foreground dark:text-muted-foreground">{cert.issuer} • {cert.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {cert.verified && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 px-2 py-1 bg-secondary dark:bg-secondary/30 text-secondary dark:text-secondary rounded-full text-xs font-medium"
                            >
                              <Check className="w-3 h-3" />
                              Verified
                            </motion.div>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-surface dark:hover:bg-surface rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                            aria-label={`Download certification for ${cert.name}`}
                          >
                            <Download className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-sm p-6"
                whileHover={{ boxShadow: "0 16px 24px -4px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.04)" }}
                transition={commonTransition}
              >
                <h2 className="text-lg font-semibold text-muted-foreground dark:text-muted-foreground mb-4">Insurance & Verification</h2>
                <div className="space-y-4">
                  <motion.div
                    whileHover={{ x: 4, boxShadow: "0 4px 8px -2px rgba(0, 0, 0, 0.05)" }}
                    transition={commonTransition}
                    className="flex items-center justify-between p-4 bg-background dark:bg-surface rounded-lg border border-border dark:border-border"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="font-medium text-muted-foreground dark:text-muted-foreground">Professional Liability Insurance</p>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">Coverage up to $2,000,000</p>
                      </div>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-secondary dark:bg-secondary/30 text-secondary dark:text-secondary rounded-full text-sm font-medium"
                    >
                      <Check className="w-4 h-4" />
                      Active
                    </motion.div>
                  </motion.div>
                  <motion.div
                    whileHover={{ x: 4, boxShadow: "0 4px 8px -2px rgba(0, 0, 0, 0.05)" }}
                    transition={commonTransition}
                    className="flex items-center justify-between p-4 bg-background dark:bg-surface rounded-lg border border-border dark:border-border"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-muted-foreground dark:text-muted-foreground">Background Check</p>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">Completed on March 15, 2024</p>
                      </div>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-secondary dark:bg-secondary/30 text-secondary dark:text-secondary rounded-full text-sm font-medium"
                    >
                      <Check className="w-4 h-4" />
                      Passed
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function FreelancerProfileDemo() {
  return <FreelancerProfile />
}