'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  attendees: string[]
  location?: string
  status: 'confirmed' | 'tentative' | 'cancelled'
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
  availability: 'available' | 'busy' | 'unknown'
}

interface CalendarCheckResult {
  conflicts: CalendarEvent[]
  availability: Record<string, 'available' | 'busy' | 'unknown'>
  suggestedTimes: Date[]
}

interface CalendarCheckAPIProps {
  groupMembers?: GroupMember[]
  proposedDate?: Date
  duration?: number // in hours
  onAvailabilityCheck?: (result: CalendarCheckResult) => void
  onScheduleEvent?: (eventData: Partial<CalendarEvent>) => void
}

export function CalendarCheckAPI({
  groupMembers = DEFAULT_GROUP_MEMBERS,
  proposedDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
  duration = 8,
  onAvailabilityCheck = (result) => console.log('Availability checked:', result),
  onScheduleEvent = (eventData) => console.log('Event scheduled:', eventData)
}: CalendarCheckAPIProps = {}) {
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<CalendarCheckResult | null>(null)
  const [selectedDate, setSelectedDate] = useState(proposedDate)
  const [isScheduling, setIsScheduling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkAvailability = async () => {
    setIsChecking(true)
    setError(null)
    
    try {
      // Simulate API call to check calendar availability
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock calendar conflicts and availability
      const conflicts: CalendarEvent[] = [
        {
          id: '1',
          title: 'Work Meeting',
          start: new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000),
          end: new Date(selectedDate.getTime() + 3 * 60 * 60 * 1000),
          attendees: ['sarah@example.com'],
          status: 'confirmed'
        }
      ]

      const availability: Record<string, 'available' | 'busy' | 'unknown'> = {}
      groupMembers.forEach(member => {
        availability[member.id] = Math.random() > 0.3 ? 'available' : 'busy'
      })

      const suggestedTimes = [
        new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000),
        new Date(selectedDate.getTime() + 48 * 60 * 60 * 1000),
        new Date(selectedDate.getTime() + 72 * 60 * 60 * 1000)
      ]

      const result: CalendarCheckResult = {
        conflicts,
        availability,
        suggestedTimes
      }

      setCheckResult(result)
      onAvailabilityCheck(result)
    } catch (err) {
      setError('Failed to check calendar availability. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  const scheduleEvent = async () => {
    setIsScheduling(true)
    setError(null)

    try {
      // Simulate API call to schedule event
      await new Promise(resolve => setTimeout(resolve, 1500))

      const eventData: Partial<CalendarEvent> = {
        title: 'Off-Road Adventure Trip',
        start: selectedDate,
        end: new Date(selectedDate.getTime() + duration * 60 * 60 * 1000),
        attendees: groupMembers.map(member => member.email),
        location: 'Moab, Utah',
        status: 'confirmed'
      }

      onScheduleEvent(eventData)
    } catch (err) {
      setError('Failed to schedule event. Please try again.')
    } finally {
      setIsScheduling(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-[rgb(34,139,34)]'
      case 'busy':
        return 'text-[rgb(220,38,38)]'
      default:
        return 'text-[rgb(156,163,175)]'
    }
  }

  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />
      case 'busy':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[rgb(34,139,34)] rounded-xl flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6 text-[rgb(255,255,255)]" />
          </div>
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Calendar Check</h1>
          <p className="text-[rgb(100,116,139)] text-sm">
            Check group availability and schedule your off-road adventure
          </p>
        </div>

        {/* Date Selection */}
        <div className="bg-[rgb(248,250,252)] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[rgb(34,139,34)]" />
            <span className="font-semibold text-[rgb(15,23,42)]">Proposed Date</span>
          </div>
          <div className="space-y-2">
            <input
              type="datetime-local"
              value={selectedDate.toISOString().slice(0, 16)}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full px-3 py-2 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] outline-none"
              style={{ minHeight: '44px' }}
            />
            <div className="flex items-center gap-2 text-sm text-[rgb(100,116,139)]">
              <Clock className="w-4 h-4" />
              <span>Duration: {duration} hours</span>
            </div>
          </div>
        </div>

        {/* Group Members */}
        <div className="bg-[rgb(248,250,252)] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[rgb(34,139,34)]" />
            <span className="font-semibold text-[rgb(15,23,42)]">Group Members</span>
          </div>
          <div className="space-y-2">
            {groupMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 bg-[rgb(255,255,255)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-[rgb(255,255,255)]">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-[rgb(15,23,42)] text-sm">{member.name}</span>
                </div>
                {checkResult && (
                  <div className={`flex items-center gap-1 ${getAvailabilityColor(checkResult.availability[member.id])}`}>
                    {getAvailabilityIcon(checkResult.availability[member.id])}
                    <span className="text-xs capitalize">
                      {checkResult.availability[member.id]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Check Availability Button */}
        <button
          onClick={checkAvailability}
          disabled={isChecking}
          className="w-full bg-[rgb(34,139,34)] text-[rgb(255,255,255)] py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: '44px' }}
        >
          {isChecking ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Checking Calendars...</span>
            </div>
          ) : (
            'Check Group Availability'
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-[rgb(254,242,242)] border border-[rgb(252,165,165)] rounded-xl p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[rgb(220,38,38)]" />
              <span className="text-[rgb(220,38,38)] text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {checkResult && (
          <div className="space-y-4">
            {/* Conflicts */}
            {checkResult.conflicts.length > 0 && (
              <div className="bg-[rgb(254,242,242)] border border-[rgb(252,165,165)] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[rgb(220,38,38)]" />
                  <span className="font-semibold text-[rgb(220,38,38)]">Schedule Conflicts</span>
                </div>
                {checkResult.conflicts.map((conflict) => (
                  <div key={conflict.id} className="bg-[rgb(255,255,255)] rounded-lg p-3">
                    <div className="font-medium text-[rgb(15,23,42)]">{conflict.title}</div>
                    <div className="text-sm text-[rgb(100,116,139)]">
                      {formatTime(conflict.start)} - {formatTime(conflict.end)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Times */}
            <div className="bg-[rgb(240,253,244)] border border-[rgb(187,247,208)] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[rgb(34,139,34)]" />
                <span className="font-semibold text-[rgb(34,139,34)]">Suggested Times</span>
              </div>
              <div className="space-y-2">
                {checkResult.suggestedTimes.map((time, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(time)}
                    className="w-full text-left p-3 bg-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(248,250,252)] transition-colors duration-150"
                    style={{ minHeight: '44px' }}
                  >
                    <div className="font-medium text-[rgb(15,23,42)]">{formatDate(time)}</div>
                    <div className="text-sm text-[rgb(100,116,139)]">
                      {formatTime(time)} - {formatTime(new Date(time.getTime() + duration * 60 * 60 * 1000))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Event Button */}
            <button
              onClick={scheduleEvent}
              disabled={isScheduling}
              className="w-full bg-[rgb(245,158,11)] text-[rgb(255,255,255)] py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '44px' }}
            >
              {isScheduling ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Scheduling Event...</span>
                </div>
              ) : (
                'Schedule Trip & Send Invites'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data for demo
const DEFAULT_GROUP_MEMBERS: GroupMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    availability: 'available'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    availability: 'busy'
  },
  {
    id: '3',
    name: 'Alex Rivera',
    email: 'alex@example.com',
    availability: 'available'
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma@example.com',
    availability: 'unknown'
  }
]

// Demo component for page.tsx
export default function CalendarCheckAPIDemo() {
  return <CalendarCheckAPI />
}