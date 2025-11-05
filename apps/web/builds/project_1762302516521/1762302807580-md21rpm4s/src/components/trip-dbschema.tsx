'use client'

import { useState } from 'react'
import { Database, Table, Key, Link, FileText, Users, Calendar, MessageCircle, MapPin, Cloud } from 'lucide-react'

interface TableSchema {
  name: string
  description: string
  fields: Field[]
  relationships: Relationship[]
}

interface Field {
  name: string
  type: string
  required: boolean
  description: string
}

interface Relationship {
  type: 'one-to-many' | 'many-to-many' | 'one-to-one'
  target: string
  description: string
}

interface TripDBSchemaProps {
  onTableSelect?: (tableName: string) => void
  showRelationships?: boolean
}

export function TripDBSchema({
  onTableSelect = () => console.log('Table selected'),
  showRelationships = true
}: TripDBSchemaProps = {}) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'visual' | 'detailed'>('visual')

  const handleTableClick = (tableName: string) => {
    setSelectedTable(selectedTable === tableName ? null : tableName)
    onTableSelect(tableName)
  }

  const tables: TableSchema[] = [
    {
      name: 'trips',
      description: 'Main trip planning entity',
      fields: [
        { name: 'id', type: 'UUID', required: true, description: 'Primary key' },
        { name: 'title', type: 'VARCHAR(255)', required: true, description: 'Trip name' },
        { name: 'description', type: 'TEXT', required: false, description: 'Trip details' },
        { name: 'location', type: 'JSONB', required: true, description: 'GPS coordinates and location data' },
        { name: 'start_date', type: 'TIMESTAMP', required: true, description: 'Trip start date/time' },
        { name: 'end_date', type: 'TIMESTAMP', required: true, description: 'Trip end date/time' },
        { name: 'created_by', type: 'UUID', required: true, description: 'Trip organizer user ID' },
        { name: 'status', type: 'ENUM', required: true, description: 'planning, confirmed, active, completed, cancelled' },
        { name: 'weather_data', type: 'JSONB', required: false, description: 'Cached weather forecast' },
        { name: 'created_at', type: 'TIMESTAMP', required: true, description: 'Record creation time' },
        { name: 'updated_at', type: 'TIMESTAMP', required: true, description: 'Last update time' }
      ],
      relationships: [
        { type: 'one-to-many', target: 'trip_members', description: 'Trip has multiple members' },
        { type: 'one-to-many', target: 'tasks', description: 'Trip has multiple tasks' },
        { type: 'one-to-many', target: 'meals', description: 'Trip has multiple planned meals' },
        { type: 'one-to-many', target: 'chat_messages', description: 'Trip has group chat messages' }
      ]
    },
    {
      name: 'users',
      description: 'User accounts and profiles',
      fields: [
        { name: 'id', type: 'UUID', required: true, description: 'Primary key' },
        { name: 'email', type: 'VARCHAR(255)', required: true, description: 'User email address' },
        { name: 'display_name', type: 'VARCHAR(100)', required: true, description: 'User display name' },
        { name: 'avatar_url', type: 'VARCHAR(500)', required: false, description: 'Profile picture URL' },
        { name: 'phone', type: 'VARCHAR(20)', required: false, description: 'Phone number' },
        { name: 'calendar_integration', type: 'JSONB', required: false, description: 'Calendar API tokens' },
        { name: 'preferences', type: 'JSONB', required: false, description: 'User preferences and settings' },
        { name: 'created_at', type: 'TIMESTAMP', required: true, description: 'Account creation time' },
        { name: 'last_active', type: 'TIMESTAMP', required: false, description: 'Last activity timestamp' }
      ],
      relationships: [
        { type: 'one-to-many', target: 'trip_members', description: 'User can be member of multiple trips' },
        { type: 'one-to-many', target: 'task_assignments', description: 'User can be assigned multiple tasks' },
        { type: 'one-to-many', target: 'chat_messages', description: 'User can send multiple messages' }
      ]
    },
    {
      name: 'trip_members',
      description: 'Trip membership and RSVP status',
      fields: [
        { name: 'id', type: 'UUID', required: true, description: 'Primary key' },
        { name: 'trip_id', type: 'UUID', required: true, description: 'Foreign key to trips' },
        { name: 'user_id', type: 'UUID', required: true, description: 'Foreign key to users' },
        { name: 'role', type: 'ENUM', required: true, description: 'organizer, member, invited' },
        { name: 'rsvp_status', type: 'ENUM', required: true, description: 'pending, accepted, declined, maybe' },
        { name: 'invited_at', type: 'TIMESTAMP', required: true, description: 'Invitation sent time' },
        { name: 'responded_at', type: 'TIMESTAMP', required: false, description: 'RSVP response time' },
        { name: 'calendar_event_id', type: 'VARCHAR(255)', required: false, description: 'External calendar event ID' }
      ],
      relationships: [
        { type: 'many-to-many', target: 'trips', description: 'Links users to trips' },
        { type: 'many-to-many', target: 'users', description: 'Links trips to users' }
      ]
    },
    {
      name: 'tasks',
      description: 'Trip tasks and assignments',
      fields: [
        { name: 'id', type: 'UUID', required: true, description: 'Primary key' },
        { name: 'trip_id', type: 'UUID', required: true, description: 'Foreign key to trips' },
        { name: 'title', type: 'VARCHAR(255)', required: true, description: 'Task name' },
        { name: 'description', type: 'TEXT', required: false, description: 'Task details' },
        { name: 'category', type: 'ENUM', required: true, description: 'food, equipment, logistics, safety' },
        { name: 'priority', type: 'ENUM', required: true, description: 'low, medium, high, critical' },
        { name: 'due_date', type: 'TIMESTAMP', required: false, description: 'Task deadline' },
        { name: 'status', type: 'ENUM', required: true, description: 'pending, in_progress, completed, cancelled' },
        { name: 'created_by', type: 'UUID', required: true, description: 'Task creator user ID' },
        { name: 'created_at', type: 'TIMESTAMP', required: true, description: 'Task creation time' }
      ],
      relationships: [
        { type: 'one-to-many', target: 'task_assignments', description: 'Task can have multiple assignees' }
      ]
    },
    {
      name: 'meals',
      description: 'Planned meals and menu',
      fields: [
        { name: 'id', type: 'UUID', required: true, description: 'Primary key' },
        { name: 'trip_id', type: 'UUID', required: true, description: 'Foreign key to trips' },
        { name: 'name', type: 'VARCHAR(255)', required: true, description: 'Meal name' },
        { name: 'meal_type', type: 'ENUM', required: true, description: 'breakfast, lunch, dinner, snack' },
        { name: 'scheduled_date', type: 'DATE', required: true, description: 'Meal date' },
        { name: 'scheduled_time', type: 'TIME', required: false, description: 'Meal time' },
        { name: 'ingredients', type: 'JSONB', required: false, description: 'Ingredient list with quantities' },
        { name: 'instructions', type: 'TEXT', required: false, description: 'Cooking instructions' },
        { name: 'dietary_notes', type: 'TEXT', required: false, description: 'Allergies, restrictions' },
        { name: 'assigned_to', type: 'UUID', required: false, description: 'User responsible for meal' }
      ],
      relationships: [
        { type: 'one-to-one', target: 'users', description: 'Meal assigned to user' }
      ]
    },
    {
      name: 'chat_messages',
      description: 'Group chat messages',
      fields: [
        { name: 'id', type: 'UUID', required: true, description: 'Primary key' },
        { name: 'trip_id', type: 'UUID', required: true, description: 'Foreign key to trips' },
        { name: 'user_id', type: 'UUID', required: true, description: 'Message sender' },
        { name: 'content', type: 'TEXT', required: true, description: 'Message content' },
        { name: 'message_type', type: 'ENUM', required: true, description: 'text, image, location, system' },
        { name: 'metadata', type: 'JSONB', required: false, description: 'Additional message data' },
        { name: 'created_at', type: 'TIMESTAMP', required: true, description: 'Message timestamp' },
        { name: 'edited_at', type: 'TIMESTAMP', required: false, description: 'Last edit timestamp' }
      ],
      relationships: []
    },
    {
      name: 'locations',
      description: 'Saved off-road locations',
      fields: [
        { name: 'id', type: 'UUID', required: true, description: 'Primary key' },
        { name: 'name', type: 'VARCHAR(255)', required: true, description: 'Location name' },
        { name: 'coordinates', type: 'POINT', required: true, description: 'GPS coordinates' },
        { name: 'description', type: 'TEXT', required: false, description: 'Location details' },
        { name: 'difficulty_level', type: 'ENUM', required: true, description: 'easy, moderate, difficult, extreme' },
        { name: 'terrain_type', type: 'ENUM', required: true, description: 'desert, forest, mountain, beach, snow' },
        { name: 'amenities', type: 'JSONB', required: false, description: 'Available facilities' },
        { name: 'access_requirements', type: 'TEXT', required: false, description: 'Permits, restrictions' },
        { name: 'created_by', type: 'UUID', required: true, description: 'User who added location' },
        { name: 'is_public', type: 'BOOLEAN', required: true, description: 'Visible to other users' }
      ],
      relationships: []
    }
  ]

  const getTableIcon = (tableName: string) => {
    const iconMap: Record<string, any> = {
      trips: MapPin,
      users: Users,
      trip_members: Users,
      tasks: FileText,
      meals: FileText,
      chat_messages: MessageCircle,
      locations: MapPin
    }
    const Icon = iconMap[tableName] || Table
    return <Icon className="w-5 h-5" />
  }

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'one-to-many': return 'border-[rgb(34,139,34)]'
      case 'many-to-many': return 'border-[rgb(249,115,22)]'
      case 'one-to-one': return 'border-[rgb(59,130,246)]'
      default: return 'border-[rgb(156,163,175)]'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-[rgb(34,139,34)]" />
            <h1 className="text-3xl font-bold text-[rgb(15,23,42)]">
              Off-Road Trip Database Schema
            </h1>
          </div>
          <p className="text-lg text-[rgb(100,116,139)] mb-6">
            Complete database structure for trip planning, member management, and group coordination
          </p>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                viewMode === 'visual'
                  ? 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)] shadow-md'
                  : 'bg-[rgb(248,250,252)] text-[rgb(100,116,139)] hover:bg-[rgb(241,245,249)]'
              }`}
              aria-label="Switch to visual view"
            >
              Visual Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                viewMode === 'detailed'
                  ? 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)] shadow-md'
                  : 'bg-[rgb(248,250,252)] text-[rgb(100,116,139)] hover:bg-[rgb(241,245,249)]'
              }`}
              aria-label="Switch to detailed view"
            >
              Detailed Schema
            </button>
          </div>
        </div>

        {viewMode === 'visual' ? (
          /* Visual Overview */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div
                key={table.name}
                className={`bg-[rgb(255,255,255)] border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg ${
                  selectedTable === table.name
                    ? 'border-[rgb(34,139,34)] ring-2 ring-[rgb(34,139,34)]/20'
                    : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]/50'
                }`}
                onClick={() => handleTableClick(table.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleTableClick(table.name)
                  }
                }}
                aria-label={`Select ${table.name} table`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {getTableIcon(table.name)}
                  <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">
                    {table.name}
                  </h3>
                </div>
                <p className="text-sm text-[rgb(100,116,139)] mb-4">
                  {table.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[rgb(100,116,139)]">Fields:</span>
                    <span className="font-medium text-[rgb(15,23,42)]">
                      {table.fields.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[rgb(100,116,139)]">Relationships:</span>
                    <span className="font-medium text-[rgb(15,23,42)]">
                      {table.relationships.length}
                    </span>
                  </div>
                </div>

                {showRelationships && table.relationships.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[rgb(226,232,240)]">
                    <div className="flex flex-wrap gap-1">
                      {table.relationships.map((rel, index) => (
                        <div
                          key={index}
                          className={`px-2 py-1 rounded text-xs font-medium border ${getRelationshipColor(rel.type)} bg-opacity-10`}
                        >
                          {rel.target}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Detailed Schema */
          <div className="space-y-8">
            {tables.map((table) => (
              <div
                key={table.name}
                className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl overflow-hidden shadow-md"
              >
                <div className="bg-[rgb(248,250,252)] px-6 py-4 border-b border-[rgb(226,232,240)]">
                  <div className="flex items-center gap-3">
                    {getTableIcon(table.name)}
                    <h3 className="text-xl font-semibold text-[rgb(15,23,42)]">
                      {table.name}
                    </h3>
                  </div>
                  <p className="text-sm text-[rgb(100,116,139)] mt-2">
                    {table.description}
                  </p>
                </div>

                <div className="p-6">
                  {/* Fields */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Fields
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[rgb(226,232,240)]">
                            <th className="text-left py-2 px-3 font-medium text-[rgb(100,116,139)]">Name</th>
                            <th className="text-left py-2 px-3 font-medium text-[rgb(100,116,139)]">Type</th>
                            <th className="text-left py-2 px-3 font-medium text-[rgb(100,116,139)]">Required</th>
                            <th className="text-left py-2 px-3 font-medium text-[rgb(100,116,139)]">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.fields.map((field, index) => (
                            <tr key={index} className="border-b border-[rgb(241,245,249)]">
                              <td className="py-2 px-3 font-medium text-[rgb(15,23,42)]">
                                {field.name}
                              </td>
                              <td className="py-2 px-3">
                                <span className="px-2 py-1 bg-[rgb(248,250,252)] text-[rgb(100,116,139)] rounded text-xs font-medium">
                                  {field.type}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  field.required
                                    ? 'bg-[rgb(220,38,38)]/10 text-[rgb(220,38,38)]'
                                    : 'bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)]'
                                }`}>
                                  {field.required ? 'Required' : 'Optional'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-[rgb(100,116,139)]">
                                {field.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Relationships */}
                  {table.relationships.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        Relationships
                      </h4>
                      <div className="space-y-3">
                        {table.relationships.map((rel, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-3 bg-[rgb(248,250,252)] rounded-lg"
                          >
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getRelationshipColor(rel.type)} bg-opacity-10`}>
                              {rel.type}
                            </span>
                            <span className="font-medium text-[rgb(15,23,42)]">
                              {rel.target}
                            </span>
                            <span className="text-sm text-[rgb(100,116,139)]">
                              {rel.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schema Statistics */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-[rgb(34,139,34)]">
              {tables.length}
            </div>
            <div className="text-sm text-[rgb(100,116,139)]">Tables</div>
          </div>
          <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-[rgb(34,139,34)]">
              {tables.reduce((acc, table) => acc + table.fields.length, 0)}
            </div>
            <div className="text-sm text-[rgb(100,116,139)]">Total Fields</div>
          </div>
          <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-[rgb(34,139,34)]">
              {tables.reduce((acc, table) => acc + table.relationships.length, 0)}
            </div>
            <div className="text-sm text-[rgb(100,116,139)]">Relationships</div>
          </div>
          <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-[rgb(34,139,34)]">
              {tables.filter(table => table.fields.some(field => field.type === 'JSONB')).length}
            </div>
            <div className="text-sm text-[rgb(100,116,139)]">JSON Fields</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TripDBSchemaDemo() {
  return <TripDBSchema />
}