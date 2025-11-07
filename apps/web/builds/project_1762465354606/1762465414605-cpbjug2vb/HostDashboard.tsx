'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Car,
  Zap,
  MapPin,
  Calendar,
  DollarSign,
  Gauge,
  Clock,
  BatteryCharging,
  ChevronRight,
  Plus,
  Settings,
  BarChart2,
  Users,
  MessageSquare,
  Power,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'

// Mock data interfaces
interface ChargingStation {
  id: string
  name: string
  location: string
  connectorType: string
  powerOutputKw: number
  pricePerKwh: number
  availability: {
    day: string
    startTime: string
    endTime: string
  }[]
  status: 'active' | 'inactive' | 'pending'
  lastActivity: string
}

interface Booking {
  id: string
  stationId: string
  stationName: string
  userName: string
  date: string
  startTime: string
  endTime: string
  status: 'upcoming' | 'completed' | 'cancelled'
  totalCost: number
}

interface HostDashboardProps {
  userId?: string
}

const DEFAULT_USER_ID = 'host_123'

const DEFAULT_STATIONS: ChargingStation[] = [
  {
    id: 'cs_001',
    name: 'Home Charger - Garage',
    location: '123 Main St, Anytown',
    connectorType: 'Type 2',
    powerOutputKw: 7.2,
    pricePerKwh: 0.25,
    availability: [
      { day: 'Monday', startTime: '18:00', endTime: '22:00' },
      { day: 'Wednesday', startTime: '19:00', endTime: '23:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00' },
    ],
    status: 'active',
    lastActivity: '2023-10-26T10:30:00Z',
  },
  {
    id: 'cs_002',
    name: 'Driveway Charger',
    location: '123 Main St, Anytown',
    connectorType: 'CCS',
    powerOutputKw: 22,
    pricePerKwh: 0.35,
    availability: [
      { day: 'Tuesday', startTime: '20:00', endTime: '00:00' },
      { day: 'Friday', startTime: '17:00', endTime: '21:00' },
    ],
    status: 'pending',
    lastActivity: '2023-10-25T14:00:00Z',
  },
]

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 'bk_001',
    stationId: 'cs_001',
    stationName: 'Home Charger - Garage',
    userName: 'Alice Smith',
    date: '2023-11-01',
    startTime: '19:00',
    endTime: '21:00',
    status: 'upcoming',
    totalCost: 5.0,
  },
  {
    id: 'bk_002',
    stationId: 'cs_001',
    stationName: 'Home Charger - Garage',
    userName: 'Bob Johnson',
    date: '2023-10-20',
    startTime: '18:00',
    endTime: '20:00',
    status: 'completed',
    totalCost: 4.5,
  },
  {
    id: 'bk_003',
    stationId: 'cs_002',
    stationName: 'Driveway Charger',
    userName: 'Charlie Brown',
    date: '2023-10-28',
    startTime: '20:00',
    endTime: '22:00',
    status: 'cancelled',
    totalCost: 0,
  },
]

type DashboardTab = 'overview' | 'stations' | 'bookings' | 'settings'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export function HostDashboard({ userId = DEFAULT_USER_ID }: HostDashboardProps = {}) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const [stations, setStations] = useState<ChargingStation[]>(DEFAULT_STATIONS)
  const [bookings, setBookings] = useState<Booking[]>(DEFAULT_BOOKINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800))
        setStations(DEFAULT_STATIONS)
        setBookings(DEFAULT_BOOKINGS)
      } catch (err) {
        setError('Failed to load dashboard data.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId])

  const handleStationAction = useCallback((action: string, stationId: string) => {
    console.log(`Action: ${action} on station: ${stationId}`)
    // In a real app, this would trigger API calls and state updates
  }, [])

  const renderOverview = () => {
    const activeStations = stations.filter((s) => s.status === 'active').length
    const pendingStations = stations.filter((s) => s.status === 'pending').length
    const upcomingBookings = bookings.filter((b) => b.status === 'upcoming').length
    const totalEarnings = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.totalCost, 0)

    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg p-6 shadow-sm"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground">Active Stations</h3>
            <Zap className="h-6 w-6 text-[#3B82F6]" />
          </div>
          <p className="text-4xl font-bold text-[#3B82F6]">{activeStations}</p>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            {pendingStations} pending activation
          </p>
        </motion.div>

        <motion.div
          className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg p-6 shadow-sm"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground">Upcoming Bookings</h3>
            <Calendar className="h-6 w-6 text-[#3B82F6]" />
          </div>
          <p className="text-4xl font-bold text-[#3B82F6]">{upcomingBookings}</p>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            {bookings.filter((b) => b.status === 'completed').length} completed recently
          </p>
        </motion.div>

        <motion.div
          className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg p-6 shadow-sm"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground">Total Earnings</h3>
            <DollarSign className="h-6 w-6 text-[#3B82F6]" />
          </div>
          <p className="text-4xl font-bold text-[#3B82F6]">
            ${totalEarnings.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            From completed charges
          </p>
        </motion.div>

        <motion.div
          className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg p-6 shadow-sm col-span-full"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground mb-4">Recent Activity</h3>
          {bookings.length > 0 ? (
            <ul className="space-y-3">
              {bookings
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 3)
                .map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {booking.status === 'completed' && <CheckCircle className="h-4 w-4 text-secondary" />}
                      {booking.status === 'upcoming' && <Clock className="h-4 w-4 text-[#3B82F6]" />}
                      {booking.status === 'cancelled' && <XCircle className="h-4 w-4 text-destructive" />}
                      <span className="text-muted-foreground dark:text-foreground">
                        {booking.status === 'completed' ? 'Completed' : booking.status === 'upcoming' ? 'Upcoming' : 'Cancelled'} charge for{' '}
                        <span className="font-medium">{booking.userName}</span> at{' '}
                        <span className="font-medium">{booking.stationName}</span>
                      </span>
                    </div>
                    <span className="text-muted-foreground dark:text-muted-foreground">
                      {new Date(booking.date).toLocaleDateString()}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-muted-foreground dark:text-muted-foreground text-sm">No recent activity.</p>
          )}
        </motion.div>
      </motion.div>
    )
  }

  const renderStations = () => {
    return (
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.button
          className="inline-flex items-center justify-center px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#3B82F6]/90 transition-all duration-150 font-medium text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 active:scale-[0.98]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Add new charging station"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Station
        </motion.button>

        {stations.length === 0 ? (
          <motion.div
            className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg p-8 text-center shadow-sm"
            variants={itemVariants}
          >
            <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground mb-2">No Charging Stations Added</h3>
            <p className="text-muted-foreground dark:text-muted-foreground mb-4">
              Start earning by adding your first charging station.
            </p>
            <motion.button
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#3B82F6]/90 transition-all duration-150 font-medium text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 active:scale-[0.98]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Add your first charging station"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Station
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {stations.map((station) => (
              <motion.div
                key={station.id}
                className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg p-6 shadow-sm hover:border-[#3B82F6]/50 transition-all duration-200"
                variants={itemVariants}
                whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground">{station.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      station.status === 'active'
                        ? 'bg-secondary text-secondary dark:bg-secondary/30 dark:text-secondary'
                        : station.status === 'pending'
                        ? 'bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]'
                        : 'bg-surface text-muted-foreground dark:bg-surface dark:text-muted-foreground'
                    }`}
                  >
                    {station.status.charAt(0).toUpperCase() + station.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground dark:text-muted-foreground mb-4">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" /> {station.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <BatteryCharging className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" /> {station.connectorType} (
                    {station.powerOutputKw} kW)
                  </p>
                  <p className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" /> ${station.pricePerKwh.toFixed(2)}/kWh
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <motion.button
                    className="inline-flex items-center justify-center p-2 bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground rounded-md hover:bg-surface dark:hover:bg-surface transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-muted dark:focus:ring-muted active:scale-[0.95]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStationAction('edit', station.id)}
                    aria-label={`Edit station ${station.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    className="inline-flex items-center justify-center p-2 bg-destructive dark:bg-destructive/20 text-destructive dark:text-destructive rounded-md hover:bg-destructive dark:hover:bg-destructive/40 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-destructive dark:focus:ring-destructive active:scale-[0.95]"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStationAction('delete', station.id)}
                    aria-label={`Delete station ${station.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    )
  }

  const renderBookings = () => {
    const sortedBookings = [...bookings].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return (
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {sortedBookings.length === 0 ? (
          <motion.div
            className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg p-8 text-center shadow-sm"
            variants={itemVariants}
          >
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground mb-2">No Bookings Yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground">
              Your stations are waiting for their first charge!
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {sortedBookings.map((booking) => (
              <motion.div
                key={booking.id}
                className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg p-6 shadow-sm hover:border-[#3B82F6]/50 transition-all duration-200"
                variants={itemVariants}
                whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground">
                    {booking.stationName}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'upcoming'
                        ? 'bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20 dark:text-[#3B82F6]'
                        : booking.status === 'completed'
                        ? 'bg-secondary text-secondary dark:bg-secondary/30 dark:text-secondary'
                        : 'bg-destructive text-destructive dark:bg-destructive/20 dark:text-destructive'
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground dark:text-muted-foreground mb-4">
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" /> Charged by{' '}
                    <span className="font-medium text-muted-foreground dark:text-foreground">{booking.userName}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />{' '}
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" /> {booking.startTime} -{' '}
                    {booking.endTime}
                  </p>
                  {booking.status === 'completed' && (
                    <p className="flex items-center gap-2 text-muted-foreground dark:text-foreground font-medium">
                      <DollarSign className="h-4 w-4 text-secondary" /> Total: $
                      {booking.totalCost.toFixed(2)}
                    </p>
                  )}
                </div>
                {booking.status === 'upcoming' && (
                  <div className="flex justify-end gap-2">
                    <motion.button
                      className="inline-flex items-center justify-center px-4 py-2 bg-destructive dark:bg-destructive/20 text-destructive dark:text-destructive rounded-lg hover:bg-destructive dark:hover:bg-destructive/40 transition-colors duration-150 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-destructive dark:focus:ring-destructive active:scale-[0.98]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label={`Cancel booking with ${booking.userName}`}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      className="inline-flex items-center justify-center px-4 py-2 bg-[#3B82F6]/10 text-[#3B82F6] rounded-lg hover:bg-[#3B82F6]/20 transition-colors duration-150 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 active:scale-[0.98]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label={`Message ${booking.userName}`}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" /> Message
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    )
  }

  const renderSettings = () => {
    return (
      <motion.div
        className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg p-6 shadow-sm space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground mb-2">Profile Settings</h3>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm mb-4">
            Manage your personal information and host profile.
          </p>
          <motion.button
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#3B82F6]/90 transition-all duration-150 font-medium text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 active:scale-[0.98]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Edit profile"
          >
            Edit Profile
            <ChevronRight className="h-4 w-4 ml-2" />
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground mb-2">Payment Information</h3>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm mb-4">
            Update your payout methods and view transaction history.
          </p>
          <motion.button
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#3B82F6]/90 transition-all duration-150 font-medium text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 active:scale-[0.98]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Manage payments"
          >
            Manage Payments
            <ChevronRight className="h-4 w-4 ml-2" />
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground mb-2">Account Management</h3>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm mb-4">
            Change password or deactivate your account.
          </p>
          <motion.button
            className="inline-flex items-center justify-center px-5 py-2.5 bg-destructive text-foreground rounded-lg hover:bg-destructive transition-all duration-150 font-medium text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-destructive/50 active:scale-[0.98]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Deactivate account"
          >
            <Power className="h-4 w-4 mr-2" /> Deactivate Account
          </motion.button>
        </motion.div>
      </motion.div>
    )
  }

  const renderContent = () => {
    if (loading) {
      const skeletonCount = activeTab === 'overview' ? 3 : 2; // Adjust based on tab content
      return (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {[...Array(skeletonCount)].map((_, i) => (
            <motion.div
              key={i}
              className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg p-6 shadow-sm animate-pulse"
              variants={itemVariants}
            >
              <div className="h-6 bg-surface dark:bg-surface rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-surface dark:bg-surface rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-surface dark:bg-surface rounded w-2/3"></div>
            </motion.div>
          ))}
        </motion.div>
      )
    }

    if (error) {
      return (
        <motion.div
          className="bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive rounded-lg p-8 text-center shadow-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-destructive dark:text-destructive mb-2">Error Loading Data</h3>
          <p className="text-destructive dark:text-destructive text-sm mb-4">{error}</p>
          <motion.button
            className="inline-flex items-center justify-center px-5 py-2.5 bg-destructive text-foreground rounded-lg hover:bg-destructive transition-all duration-150 font-medium text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-destructive/50 active:scale-[0.98]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            aria-label="Retry loading data"
          >
            Retry
          </motion.button>
        </motion.div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'stations':
        return renderStations()
      case 'bookings':
        return renderBookings()
      case 'settings':
        return renderSettings()
      default:
        return null
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-surface dark:bg-surface font-sans text-muted-foreground dark:text-foreground"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-muted-foreground dark:text-foreground mb-6">Host Dashboard</h1>

        <div className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg shadow-md p-4 mb-6 sticky top-0 z-10">
          <nav className="flex justify-around sm:justify-start gap-4">
            <motion.button
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                activeTab === 'overview'
                  ? 'bg-[#3B82F6] text-foreground shadow-sm'
                  : 'text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface'
              }`}
              onClick={() => setActiveTab('overview')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-current={activeTab === 'overview' ? 'page' : undefined}
            >
              <BarChart2 className="h-4 w-4 inline-block mr-2" /> Overview
            </motion.button>
            <motion.button
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                activeTab === 'stations'
                  ? 'bg-[#3B82F6] text-foreground shadow-sm'
                  : 'text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface'
              }`}
              onClick={() => setActiveTab('stations')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-current={activeTab === 'stations' ? 'page' : undefined}
            >
              <Zap className="h-4 w-4 inline-block mr-2" /> Stations
            </motion.button>
            <motion.button
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                activeTab === 'bookings'
                  ? 'bg-[#3B82F6] text-foreground shadow-sm'
                  : 'text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface'
              }`}
              onClick={() => setActiveTab('bookings')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-current={activeTab === 'bookings' ? 'page' : undefined}
            >
              <Calendar className="h-4 w-4 inline-block mr-2" /> Bookings
            </motion.button>
            <motion.button
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                activeTab === 'settings'
                  ? 'bg-[#3B82F6] text-foreground shadow-sm'
                  : 'text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface'
              }`}
              onClick={() => setActiveTab('settings')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-current={activeTab === 'settings' ? 'page' : undefined}
            >
              <Settings className="h-4 w-4 inline-block mr-2" /> Settings
            </motion.button>
          </nav>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function HostDashboardDemo() {
  return <HostDashboard />
}