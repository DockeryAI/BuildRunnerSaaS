'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Car,
  Zap,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  ChevronRight,
  Plus,
  ArrowRight,
  Settings,
  LogOut,
  Star,
  MessageSquare,
  Wallet,
  Gauge,
  BatteryCharging,
  User,
  Bell,
  XCircle,
  Loader2
} from 'lucide-react'

// Mock data types
interface ChargingSession {
  id: string
  stationName: string
  location: string
  date: string
  duration: string
  cost: number
  status: 'completed' | 'pending' | 'cancelled'
  rating?: number
}

interface HostStation {
  id: string
  name: string
  location: string
  chargerType: string
  pricePerHour: number
  availability: string
  status: 'active' | 'inactive' | 'pending'
}

interface UserProfile {
  name: string
  email: string
  avatarUrl: string
  totalSessions: number
  totalEarnings: number
  memberSince: string
}

interface UserDashboardProps {
  profile?: UserProfile
  chargingSessions?: ChargingSession[]
  hostStations?: HostStation[]
  onViewAllSessions?: () => void
  onViewAllStations?: () => void
  onAddStation?: () => void
  onManageAccount?: () => void
  onLogout?: () => void
  onNotifications?: () => void
  isLoading?: boolean
  error?: string | null
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=AJ',
  totalSessions: 12,
  totalEarnings: 345.50,
  memberSince: 'Jan 2023',
}

const DEFAULT_CHARGING_SESSIONS: ChargingSession[] = [
  {
    id: 'cs1',
    stationName: 'Downtown Fast Charge',
    location: '123 Main St, City',
    date: '2024-07-20',
    duration: '2h 15m',
    cost: 15.75,
    status: 'completed',
    rating: 5,
  },
  {
    id: 'cs2',
    stationName: 'Suburb Home Charger',
    location: '456 Oak Ave, Town',
    date: '2024-07-18',
    duration: '4h 00m',
    cost: 22.00,
    status: 'completed',
    rating: 4,
  },
  {
    id: 'cs3',
    stationName: 'Office Park Station',
    location: '789 Business Rd, City',
    date: '2024-07-22',
    duration: '3h 30m',
    cost: 0, // Pending sessions might not have a final cost yet
    status: 'pending',
  },
]

const DEFAULT_HOST_STATIONS: HostStation[] = [
  {
    id: 'hs1',
    name: 'My Home Charger',
    location: '101 Pine Ln, Town',
    chargerType: 'Level 2',
    pricePerHour: 3.50,
    availability: 'Evenings & Weekends',
    status: 'active',
  },
  {
    id: 'hs2',
    name: 'Garage EV Point',
    location: '202 Elm St, City',
    chargerType: 'Level 1',
    pricePerHour: 2.00,
    availability: 'Weekdays',
    status: 'inactive',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function UserDashboard({
  profile = DEFAULT_PROFILE,
  chargingSessions = DEFAULT_CHARGING_SESSIONS,
  hostStations = DEFAULT_HOST_STATIONS,
  onViewAllSessions = () => console.log('View all sessions'),
  onViewAllStations = () => console.log('View all stations'),
  onAddStation = () => console.log('Add new station'),
  onManageAccount = () => console.log('Manage account'),
  onLogout = () => console.log('Logout'),
  onNotifications = () => console.log('View notifications'),
  isLoading = false,
  error = null,
}: UserDashboardProps = {}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'hosting'>(
    'overview'
  )

  const renderStarRating = (rating: number | undefined) => {
    if (rating === undefined) return null
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'text-accent fill-accent' : 'text-muted-foreground'}
          />
        ))}
      </div>
    )
  }

  const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-surface dark:bg-surface rounded w-3/4"></div>
      <div className="h-4 bg-surface dark:bg-surface rounded w-1/2"></div>
      <div className="h-4 bg-surface dark:bg-surface rounded w-2/3"></div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background text-foreground font-inter"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold leading-tight">Dashboard</h1>
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onNotifications}
              className="relative p-2 rounded-full bg-muted hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-150"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Notifications"
            >
              <Bell size={20} className="text-foreground" />
              {/* Example notification badge */}
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            </motion.button>
            <motion.button
              onClick={onManageAccount}
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-150"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Manage Account"
            >
              <User size={20} />
              <span className="hidden sm:inline">{profile.name}</span>
            </motion.button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-4 flex items-center gap-2"
          >
            <XCircle className="text-destructive dark:text-destructive" size={20} />
            <p className="text-sm text-destructive dark:text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Profile Card */}
        <motion.div
          className="bg-surface border border-border rounded-xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <>
              <div className="flex items-center gap-4">
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.name}'s avatar`}
                  className="w-16 h-16 rounded-full border-2 border-primary"
                />
                <div>
                  <h2 className="text-xl font-semibold leading-tight">{profile.name}</h2>
                  <p className="text-muted-foreground text-sm leading-normal">{profile.email}</p>
                  <p className="text-muted-foreground text-xs mt-1 leading-normal">
                    Member since {profile.memberSince}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm leading-normal">
                  <BatteryCharging size={18} className="text-primary" />
                  <span className="font-medium">Total Sessions:</span> {profile.totalSessions}
                </div>
                <div className="flex items-center gap-2 text-sm leading-normal">
                  <Wallet size={18} className="text-accent" />
                  <span className="font-medium">Total Earnings:</span> ${profile.totalEarnings.toFixed(2)}
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          className="flex border-b border-border overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <motion.button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-sm font-medium leading-normal ${
              activeTab === 'overview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            } transition-colors duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-controls="overview-panel"
            aria-selected={activeTab === 'overview'}
            role="tab"
          >
            Overview
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-4 text-sm font-medium leading-normal ${
              activeTab === 'sessions'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            } transition-colors duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-controls="sessions-panel"
            aria-selected={activeTab === 'sessions'}
            role="tab"
          >
            My Sessions
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('hosting')}
            className={`py-3 px-4 text-sm font-medium leading-normal ${
              activeTab === 'hosting'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            } transition-colors duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-controls="hosting-panel"
            aria-selected={activeTab === 'hosting'}
            role="tab"
          >
            My Hosting
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              id="overview-panel"
              role="tabpanel"
            >
              {/* Quick Stats */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-center gap-4 animate-pulse">
                      <div className="p-3 rounded-full bg-surface dark:bg-surface h-10 w-10"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-surface dark:bg-surface rounded w-3/4"></div>
                        <div className="h-6 bg-surface dark:bg-surface rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <motion.div
                      className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                      variants={itemVariants}
                    >
                      <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Gauge size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground leading-normal">Total kWh Charged</p>
                        <p className="text-xl font-semibold leading-tight">1,245 kWh</p>
                      </div>
                    </motion.div>
                    <motion.div
                      className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                      variants={itemVariants}
                    >
                      <div className="p-3 rounded-full bg-accent/10 text-accent">
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground leading-normal">Estimated Savings</p>
                        <p className="text-xl font-semibold leading-tight">$180.50</p>
                      </div>
                    </motion.div>
                    <motion.div
                      className="bg-surface border border-border rounded-xl p-5 shadow-sm flex items-center gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                      variants={itemVariants}
                    >
                      <div className="p-3 rounded-full bg-secondary/10 text-secondary">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground leading-normal">Unread Messages</p>
                        <p className="text-xl font-semibold leading-tight">3</p>
                      </div>
                    </motion.div>
                  </>
                )}
              </motion.div>

              {/* Recent Sessions */}
              <motion.div
                className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold leading-tight">Recent Charging Sessions</h3>
                  <motion.button
                    onClick={onViewAllSessions}
                    className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="View all recent charging sessions"
                  >
                    View All <ChevronRight size={16} />
                  </motion.button>
                </div>
                {isLoading ? (
                  <SkeletonLoader />
                ) : chargingSessions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Zap size={48} className="mx-auto mb-4 text-muted-foreground dark:text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground mb-2 leading-tight">No recent charging sessions found.</h3>
                    <p className="text-muted-foreground text-sm leading-normal">Start charging to see your sessions here.</p>
                  </div>
                ) : (
                  <motion.div variants={containerVariants} initial="hidden" animate="show">
                    {chargingSessions.slice(0, 3).map((session) => (
                      <motion.div
                        key={session.id}
                        className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                        variants={itemVariants}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <Car size={18} />
                          </div>
                          <div>
                            <p className="font-medium leading-tight">{session.stationName}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 leading-normal">
                              <MapPin size={14} /> {session.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium flex items-center gap-1 justify-end leading-normal">
                            <Clock size={14} /> {session.duration}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end leading-normal">
                            <Calendar size={14} /> {session.date}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* My Host Stations */}
              <motion.div
                className="bg-surface border border-border rounded-xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold leading-tight">My Host Stations</h3>
                  <motion.button
                    onClick={onViewAllStations}
                    className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="View all host stations"
                  >
                    View All <ChevronRight size={16} />
                  </motion.button>
                </div>
                {isLoading ? (
                  <SkeletonLoader />
                ) : hostStations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Zap size={48} className="mx-auto mb-4 text-muted-foreground dark:text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground mb-2 leading-tight">You are not hosting any charging stations yet.</h3>
                    <p className="text-muted-foreground text-sm leading-normal">Become a host and earn from your charger.</p>
                    <motion.button
                      onClick={onAddStation}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-md hover:bg-primary/90 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label="Add new station"
                    >
                      <Plus size={16} /> Add New Station
                    </motion.button>
                  </div>
                ) : (
                  <motion.div variants={containerVariants} initial="hidden" animate="show">
                    {hostStations.slice(0, 2).map((station) => (
                      <motion.div
                        key={station.id}
                        className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                        variants={itemVariants}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-accent/10 text-accent">
                            <Zap size={18} />
                          </div>
                          <div>
                            <p className="font-medium leading-tight">{station.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 leading-normal">
                              <MapPin size={14} /> {station.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium leading-normal ${
                              station.status === 'active'
                                ? 'bg-accent/10 text-accent'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {station.status}
                          </span>
                          <p className="text-sm text-muted-foreground mt-1 leading-normal">
                            ${station.pricePerHour.toFixed(2)}/hr
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              id="sessions-panel"
              role="tabpanel"
            >
              <motion.div
                className="bg-surface border border-border rounded-xl p-6 shadow-sm"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                <h3 className="text-lg font-semibold mb-4 leading-tight">All Charging Sessions</h3>
                {isLoading ? (
                  <SkeletonLoader />
                ) : chargingSessions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Zap size={48} className="mx-auto mb-4 text-muted-foreground dark:text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground mb-2 leading-tight">You haven't completed any charging sessions yet.</h3>
                    <p className="text-muted-foreground text-sm leading-normal">Find a charger and start your first session!</p>
                    <motion.button
                      onClick={() => console.log('Find a charger')}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-md hover:bg-primary/90 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label="Find a charger"
                    >
                      <MapPin size={16} /> Find a Charger
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chargingSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        className="bg-muted/30 border border-border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                        variants={itemVariants}
                      >
                        <div className="flex-grow">
                          <p className="font-medium text-lg leading-tight">{session.stationName}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 leading-normal">
                            <MapPin size={14} /> {session.location}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm leading-normal">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                session.status === 'completed'
                                  ? 'bg-accent/10 text-accent'
                                  : session.status === 'pending'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-destructive/10 text-destructive'
                              }`}
                            >
                              {session.status}
                            </span>
                            {session.rating && renderStarRating(session.rating)}
                          </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-1">
                          <p className="text-base font-semibold leading-tight">
                            {session.cost > 0 ? `$${session.cost.toFixed(2)}` : 'Free'}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 leading-normal">
                            <Clock size={14} /> {session.duration}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 leading-normal">
                            <Calendar size={14} /> {session.date}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'hosting' && (
            <motion.div
              key="hosting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              id="hosting-panel"
              role="tabpanel"
            >
              <motion.div
                className="bg-surface border border-border rounded-xl p-6 shadow-sm"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold leading-tight">My Charging Stations</h3>
                  <motion.button
                    onClick={onAddStation}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-md hover:bg-primary/90 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Add new charging station"
                  >
                    <Plus size={16} /> Add Station
                  </motion.button>
                </div>
                {isLoading ? (
                  <SkeletonLoader />
                ) : hostStations.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Zap size={48} className="mx-auto mb-4 text-muted-foreground dark:text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground mb-2 leading-tight">You are not hosting any charging stations yet.</h3>
                    <p className="text-muted-foreground text-sm leading-normal">Start earning by sharing your charger with others.</p>
                    <motion.button
                      onClick={onAddStation}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-md hover:bg-primary/90 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label="Add your first station"
                    >
                      <Plus size={16} /> Add Your First Station
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hostStations.map((station) => (
                      <motion.div
                        key={station.id}
                        className="bg-muted/30 border border-border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                        variants={itemVariants}
                      >
                        <div className="flex-grow">
                          <p className="font-medium text-lg leading-tight">{station.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 leading-normal">
                            <MapPin size={14} /> {station.location}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm leading-normal">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                station.status === 'active'
                                  ? 'bg-accent/10 text-accent'
                                  : station.status === 'pending'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {station.status}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                              {station.chargerType}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-1">
                          <p className="text-base font-semibold leading-tight">
                            ${station.pricePerHour.toFixed(2)}/hr
                          </p>
                          <p className="text-sm text-muted-foreground leading-normal">
                            Available: {station.availability}
                          </p>
                          <motion.button
                            onClick={() => console.log(`Manage station ${station.id}`)}
                            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors duration-150 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            aria-label={`Manage station ${station.name}`}
                          >
                            Manage <ArrowRight size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <motion.div
          className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <motion.button
            onClick={onManageAccount}
            className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Account Settings"
          >
            <Settings size={16} /> Account Settings
          </motion.button>
          <motion.button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-primary-foreground rounded-lg text-sm font-medium shadow-md hover:bg-destructive/90 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Log Out"
          >
            <LogOut size={16} /> Log Out
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function UserDashboardDemo() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Example of setting an error
      // setError("Failed to load some dashboard data. Please try again later.");
    }, 1500); // Simulate network delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <UserDashboard
      isLoading={isLoading}
      error={error}
      // You can pass custom data or leave it to use defaults
      // profile={{ ...DEFAULT_PROFILE, name: "Jane Doe" }}
      // chargingSessions={[]} // Example of empty state
    />
  );
}