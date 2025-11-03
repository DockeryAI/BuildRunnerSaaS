```typescript
import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DayAvailability {
  date: Date;
  timeSlots: TimeSlot[];
}

interface CalendarProps {
  /** Initial date to display calendar for */
  initialDate?: Date;
  /** Callback when a time slot is selected */
  onTimeSlotSelect?: (date: Date, time: string) => void;
  /** Minimum time that can be selected (24h format) */
  minTime?: string;
  /** Maximum time that can be selected (24h format) */
  maxTime?: string;
  /** Interval between time slots in minutes */
  timeSlotInterval?: number;
}

/**
 * Calendar and availability selection component
 */
export const Calendar: React.FC<CalendarProps> = ({
  initialDate = new Date(),
  onTimeSlotSelect,
  minTime = '09:00',
  maxTime = '17:00',
  timeSlotInterval = 30
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(initialDate));
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generates time slots between min and max time
   */
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const [minHour, minMinute] = minTime.split(':').map(Number);
    const [maxHour, maxMinute] = maxTime.split(':').map(Number);
    
    let currentTime = new Date(date);
    currentTime.setHours(minHour, minMinute, 0);
    
    const endTime = new Date(date);
    endTime.setHours(maxHour, maxMinute, 0);

    while (currentTime <= endTime) {
      slots.push({
        time: format(currentTime, 'HH:mm'),
        available: true
      });
      currentTime = new Date(currentTime.getTime() + timeSlotInterval * 60000);
    }

    return slots;
  };

  /**
   * Fetches availability data for the current month
   */
  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate mock availability data
      const monthDays = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
      });

      const availabilityData = monthDays.map(date => ({
        date,
        timeSlots: generateTimeSlots(date)
      }));

      setAvailability(availabilityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [currentMonth]);

  /**
   * Handles time slot selection
   */
  const handleTimeSlotSelect = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hours, minutes, 0);
    onTimeSlotSelect?.(selectedDateTime, time);
  };

  const renderTimeSlots = (date: Date) => {
    const dayAvailability = availability.find(a => isSameDay(a.date, date));
    if (!dayAvailability) return null;

    return (
      <div className="time-slots">
        {dayAvailability.timeSlots.map(slot => (
          <button
            key={slot.time}
            className={`time-slot ${slot.available ? 'available' : 'unavailable'}`}
            onClick={() => slot.available && handleTimeSlotSelect(date, slot.time)}
            disabled={!slot.available}
          >
            {slot.time}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="calendar-container">
      {error && <div className="error-message">{error}</div>}
      
      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          Previous
        </button>
        <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          Next
        </button>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          availability.map(({ date }) => (
            <div
              key={date.toISOString()}
              className={`calendar-day ${
                !isSameMonth(date, currentMonth) ? 'other-month' : ''
              } ${isSameDay(date, selectedDate) ? 'selected' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="date-number">{format(date, 'd')}</div>
              {isSameDay(date, selectedDate) && renderTimeSlots(date)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Calendar;
```