'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Database } from '@supabase/supabase-js';

interface Trip {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: Location;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
}

interface Member {
  id: string;
  trip_id: string;
  user_id: string;
  role: 'organizer' | 'participant';
  rsvp_status: 'pending' | 'accepted' | 'declined';
  joined_at: string;
}

interface Task {
  id: string;
  trip_id: string;
  title: string;
  description: string;
  assigned_to: string[];
  due_date: string;
  status: 'todo' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

interface Meal {
  id: string;
  trip_id: string;
  name: string;
  description: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  assigned_to: string[];
  dietary_restrictions: string[];
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  trip_id: string;
  user_id: string;
  content: string;
  created_at: string;
  attachments: Attachment[];
}

interface Attachment {
  id: string;
  message_id: string;
  file_url: string;
  file_type: string;
  file_name: string;
  created_at: string;
}

interface Weather {
  trip_id: string;
  date: string;
  temperature: number;
  conditions: string;
  precipitation_chance: number;
  wind_speed: number;
  updated_at: string;
}

interface Calendar {
  trip_id: string;
  user_id: string;
  availability: {
    date: string;
    available: boolean;
  }[];
}

export interface Schema {
  public: {
    Tables: {
      trips: {
        Row: Trip;
        Insert: Omit<Trip, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Trip, 'id'>>;
      };
      locations: {
        Row: Location;
        Insert: Omit<Location, 'id'>;
        Update: Partial<Omit<Location, 'id'>>;
      };
      members: {
        Row: Member;
        Insert: Omit<Member, 'id' | 'joined_at'>;
        Update: Partial<Omit<Member, 'id'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Task, 'id'>>;
      };
      meals: {
        Row: Meal;
        Insert: Omit<Meal, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Meal, 'id'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id'>>;
      };
      attachments: {
        Row: Attachment;
        Insert: Omit<Attachment, 'id' | 'created_at'>;
        Update: Partial<Omit<Attachment, 'id'>>;
      };
      weather: {
        Row: Weather;
        Insert: Omit<Weather, 'updated_at'>;
        Update: Partial<Weather>;
      };
      calendars: {
        Row: Calendar;
        Insert: Calendar;
        Update: Partial<Calendar>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type SupaDatabase = Database<Schema>;

export default function DatabaseSchemaDemo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-[#F8F7F4] dark:bg-[#1A1D1A] rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
    >
      <h2 className="text-2xl font-semibold text-[#2D5A27] dark:text-[#E5E7E5] mb-4 font-sans">
        Database Schema Structure
      </h2>
      <motion.pre
        className="bg-[#FFFFFF] dark:bg-[#242824] p-4 rounded-md overflow-auto text-sm font-mono border border-[#D2D0C8] dark:border-[#242824] focus-within:ring-2 focus-within:ring-[#2D5A2733]"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {JSON.stringify({
          tables: [
            'trips',
            'locations',
            'members',
            'tasks',
            'meals',
            'messages',
            'attachments',
            'weather',
            'calendars'
          ]
        }, null, 2)}
      </motion.pre>
    </motion.div>
  );
}