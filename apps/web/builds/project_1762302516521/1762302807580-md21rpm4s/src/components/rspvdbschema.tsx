'use client'

import { useState, useEffect } from 'react'
import { Database, Table, Key, Link, FileText, Users, Calendar, MessageSquare, MapPin, Utensils, CloudRain } from 'lucide-react'

interface DatabaseTable {
  id: string
  name: string
  description: string
  fields: DatabaseField[]
  relationships: Relationship[]
}

interface DatabaseField {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'uuid'
  required: boolean
  unique?: boolean
  primaryKey?: boolean
  foreignKey?: string
}

interface Relationship {
  id: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  fromTable: string
  toTable: string
  description: string
}

const RSVP_SCHEMA_TABLES: DatabaseTable[] = [
  {
    id: 'trips',
    name: 'trips',
    description: 'Main trip planning table storing trip details and metadata',
    fields: [
      { id: 'trip_id', name: 'trip_id', type: 'uuid', required: true, primaryKey: true },
      { id: 'title', name: 'title', type: 'string', required: true },
      { id: 'description', name: 'description', type: 'string', required: false },
      { id: 'location', name: 'location', type: 'json', required: true },
      { id: 'start_date', name: 'start_date', type: 'date', required: true },
      { id: 'end_date', name: 'end_date', type: 'date', required: true },
      { id: 'created_by', name: 'created_by', type: 'uuid', required: true, foreignKey: 'users.user_id' },
      { id: 'status', name: 'status', type: 'string', required: true },
      { id: 'weather_data', name: 'weather_data', type: 'json', required: false },
      { id: 'created_at', name: 'created_at', type: 'date', required: true },
      { id: 'updated_at', name: 'updated_at', type: 'date', required: true }
    ],
    relationships: [
      { id: 'trips_users', type: 'one-to-many', fromTable: 'trips', toTable: 'trip_members', description: 'Trip has many members' },
      { id: 'trips_tasks', type: 'one-to-many', fromTable: 'trips', toTable: 'trip_tasks', description: 'Trip has many tasks' },
      { id: 'trips_meals', type: 'one-to-many', fromTable: 'trips', toTable: 'trip_meals', description: 'Trip has many meals' }
    ]
  },
  {
    id: 'users',
    name: 'users',
    description: 'User accounts and profile information',
    fields: [
      { id: 'user_id', name: 'user_id', type: 'uuid', required: true, primaryKey: true },
      { id: 'email', name: 'email', type: 'string', required: true, unique: true },
      { id: 'display_name', name: 'display_name', type: 'string', required: true },
      { id: 'avatar_url', name: 'avatar_url', type: 'string', required: false },
      { id: 'phone', name: 'phone', type: 'string', required: false },
      { id: 'calendar_integration', name: 'calendar_integration', type: 'json', required: false },
      { id: 'notification_preferences', name: 'notification_preferences', type: 'json', required: false },
      { id: 'created_at', name: 'created_at', type: 'date', required: true },
      { id: 'last_active', name: 'last_active', type: 'date', required: false }
    ],
    relationships: [
      { id: 'users_trips', type: 'one-to-many', fromTable: 'users', toTable: 'trip_members', description: 'User can be member of many trips' }
    ]
  },
  {
    id: 'trip_members',
    name: 'trip_members',
    description: 'Junction table for trip participants with RSVP status',
    fields: [
      { id: 'member_id', name: 'member_id', type: 'uuid', required: true, primaryKey: true },
      { id: 'trip_id', name: 'trip_id', type: 'uuid', required: true, foreignKey: 'trips.trip_id' },
      { id: 'user_id', name: 'user_id', type: 'uuid', required: true, foreignKey: 'users.user_id' },
      { id: 'rsvp_status', name: 'rsvp_status', type: 'string', required: true },
      { id: 'role', name: 'role', type: 'string', required: true },
      { id: 'invited_at', name: 'invited_at', type: 'date', required: true },
      { id: 'responded_at', name: 'responded_at', type: 'date', required: false },
      { id: 'notes', name: 'notes', type: 'string', required: false }
    ],
    relationships: [
      { id: 'members_tasks', type: 'one-to-many', fromTable: 'trip_members', toTable: 'task_assignments', description: 'Member can be assigned to many tasks' }
    ]
  },
  {
    id: 'trip_tasks',
    name: 'trip_tasks',
    description: 'Tasks and responsibilities for trip planning',
    fields: [
      { id: 'task_id', name: 'task_id', type: 'uuid', required: true, primaryKey: true },
      { id: 'trip_id', name: 'trip_id', type: 'uuid', required: true, foreignKey: 'trips.trip_id' },
      { id: 'title', name: 'title', type: 'string', required: true },
      { id: 'description', name: 'description', type: 'string', required: false },
      { id: 'category', name: 'category', type: 'string', required: true },
      { id: 'due_date', name: 'due_date', type: 'date', required: false },
      { id: 'priority', name: 'priority', type: 'string', required: true },
      { id: 'status', name: 'status', type: 'string', required: true },
      { id: 'created_by', name: 'created_by', type: 'uuid', required: true, foreignKey: 'users.user_id' },
      { id: 'created_at', name: 'created_at', type: 'date', required: true }
    ],
    relationships: [
      { id: 'tasks_assignments', type: 'one-to-many', fromTable: 'trip_tasks', toTable: 'task_assignments', description: 'Task can have many assignments' }
    ]
  },
  {
    id: 'task_assignments',
    name: 'task_assignments',
    description: 'Assignment of tasks to specific trip members',
    fields: [
      { id: 'assignment_id', name: 'assignment_id', type: 'uuid', required: true, primaryKey: true },
      { id: 'task_id', name: 'task_id', type: 'uuid', required: true, foreignKey: 'trip_tasks.task_id' },
      { id: 'member_id', name: 'member_id', type: 'uuid', required: true, foreignKey: 'trip_members.member_id' },
      { id: 'assigned_at', name: 'assigned_at', type: 'date', required: true },
      { id: 'completed_at', name: 'completed_at', type: 'date', required: false },
      { id: 'notes', name: 'notes', type: 'string', required: false }
    ],
    relationships: []
  },
  {
    id: 'trip_meals',
    name: 'trip_meals',
    description: 'Meal planning and menu for trips',
    fields: [
      { id: 'meal_id', name: 'meal_id', type: 'uuid', required: true, primaryKey: true },
      { id: 'trip_id', name: 'trip_id', type: 'uuid', required: true, foreignKey: 'trips.trip_id' },
      { id: 'meal_name', name: 'meal_name', type: 'string', required: true },
      { id: 'meal_type', name: 'meal_type', type: 'string', required: true },
      { id: 'scheduled_date', name: 'scheduled_date', type: 'date', required: true },
      { id: 'scheduled_time', name: 'scheduled_time', type: 'string', required: false },
      { id: 'description', name: 'description', type: 'string', required: false },
      { id: 'ingredients', name: 'ingredients', type: 'json', required: false },
      { id: 'dietary_restrictions', name: 'dietary_restrictions', type: 'json', required: false },
      { id: 'assigned_to', name: 'assigned_to', type: 'uuid', required: false, foreignKey: 'trip_members.member_id' },
      { id: 'created_at', name: 'created_at', type: 'date', required: true }
    ],
    relationships: []
  },
  {
    id: 'trip_chat',
    name: 'trip_chat',
    description: 'Group chat messages for trip coordination',
    fields: [
      { id: 'message_id', name: 'message_id', type: 'uuid', required: true, primaryKey: true },
      { id: 'trip_id', name: 'trip_id', type: 'uuid', required: true, foreignKey: 'trips.trip_id' },
      { id: 'sender_id', name: 'sender_id', type: 'uuid', required: true, foreignKey: 'users.user_id' },
      { id: 'message_text', name: 'message_text', type: 'string', required: true },
      { id: 'message_type', name: 'message_type', type: 'string', required: true },
      { id: 'attachments', name: 'attachments', type: 'json', required: false },
      { id: 'reply_to', name: 'reply_to', type: 'uuid', required: false, foreignKey: 'trip_chat.message_id' },
      { id: 'sent_at', name: 'sent_at', type: 'date', required: true },
      { id: 'edited_at', name: 'edited_at', type: 'date', required: false }
    ],
    relationships: []
  },
  {
    id: 'saved_locations',
    name: 'saved_locations',
    description: 'User saved off-road locations and points of interest',
    fields: [
      { id: 'location_id', name: 'location_id', type: 'uuid', required: true, primaryKey: true },
      { id: 'user_id', name: 'user_id', type: 'uuid', required: true, foreignKey: 'users.user_id' },
      { id: 'name', name: 'name', type: 'string', required: true },
      { id: 'description', name: 'description', type: 'string', required: false },
      { id: 'coordinates', name: 'coordinates', type: 'json', required: true },
      { id: 'location_type', name: 'location_type', type: 'string', required: true },
      { id: 'difficulty_level', name: 'difficulty_level', type: 'string', required: false },
      { id: 'tags', name: 'tags', type: 'json', required: false },
      { id: 'photos', name: 'photos', type: 'json', required: false },
      { id: 'is_public', name: 'is_public', type: 'boolean', required: true },
      { id: 'created_at', name: 'created_at', type: 'date', required: true }
    ],
    relationships: []
  }
]

const TYPE_COLORS = {
  string: 'bg-blue-100 text-blue-800 border-blue-200',
  number: 'bg-green-100 text-green-800 border-green-200',
  boolean: 'bg-purple-100 text-purple-800 border-purple-200',
  date: 'bg-orange-100 text-orange-800 border-orange-200',
  json: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  uuid: 'bg-[rgb(248, 250, 252)] text-gray-800 border-[rgb(226, 232, 240)]'
}

const RELATIONSHIP_COLORS = {
  'one-to-one': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'one-to-many': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'many-to-many': 'bg-rose-100 text-rose-800 border-rose-200'
}

interface RSVPDBSchemaProps {
  tables?: DatabaseTable[]
  showRelationships?: boolean
  expandedTables?: string[]
  onTableToggle?: (tableId: string) => void
}

export function RSVPDBSchema({
  tables = RSVP_SCHEMA_TABLES,
  showRelationships = true,
  expandedTables = [],
  onTableToggle = () => {}
}: RSVPDBSchemaProps = {}) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTableIcon = (tableName: string) => {
    if (tableName.includes('trip')) return MapPin
    if (tableName.includes('user')) return Users
    if (tableName.includes('chat')) return MessageSquare
    if (tableName.includes('meal')) return Utensils
    if (tableName.includes('location')) return MapPin
    return Table
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[rgb(34,139,34)] rounded-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[rgb(15,23,42)]">RSVP Database Schema</h1>
              <p className="text-[rgb(100,116,139)] mt-1">Off-road trip planning database structure</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex bg-[rgb(248,250,252)] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                    viewMode === 'overview'
                      ? 'bg-white text-[rgb(15,23,42)] shadow-sm'
                      : 'text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                    viewMode === 'detailed'
                      ? 'bg-white text-[rgb(15,23,42)] shadow-sm'
                      : 'text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
                  }`}
                >
                  Detailed
                </button>
              </div>
            </div>

            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(100,116,139)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              />
              <FileText className="absolute left-3 top-2.5 w-4 h-4 text-[rgb(100,116,139)]" />
            </div>
          </div>
        </div>

        {/* Schema Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[rgb(15,23,42)]">{tables.length}</div>
            <div className="text-sm text-[rgb(100,116,139)]">Tables</div>
          </div>
          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[rgb(15,23,42)]">
              {tables.reduce((acc, table) => acc + table.fields.length, 0)}
            </div>
            <div className="text-sm text-[rgb(100,116,139)]">Fields</div>
          </div>
          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[rgb(15,23,42)]">
              {tables.reduce((acc, table) => acc + table.relationships.length, 0)}
            </div>
            <div className="text-sm text-[rgb(100,116,139)]">Relations</div>
          </div>
          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[rgb(15,23,42)]">
              {tables.reduce((acc, table) => acc + table.fields.filter(f => f.primaryKey).length, 0)}
            </div>
            <div className="text-sm text-[rgb(100,116,139)]">Primary Keys</div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid gap-6">
          {filteredTables.map((table) => {
            const TableIcon = getTableIcon(table.name)
            const isExpanded = expandedTables.includes(table.id) || viewMode === 'detailed'

            return (
              <div
                key={table.id}
                className="bg-white border border-[rgb(226,232,240)] rounded-xl overflow-hidden hover:border-[rgb(34,139,34)]/50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {/* Table Header */}
                <div
                  className="p-6 border-b border-[rgb(226,232,240)] cursor-pointer"
                  onClick={() => {
                    setSelectedTable(selectedTable === table.id ? null : table.id)
                    onTableToggle(table.id)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[rgb(34,139,34)]/10 rounded-lg">
                        <TableIcon className="w-5 h-5 text-[rgb(34,139,34)]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">{table.name}</h3>
                        <p className="text-sm text-[rgb(100,116,139)] mt-1">{table.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-[rgb(248,250,252)] text-[rgb(100,116,139)] rounded-md text-xs font-medium">
                        {table.fields.length} fields
                      </span>
                      <span className="px-2 py-1 bg-[rgb(248,250,252)] text-[rgb(100,116,139)] rounded-md text-xs font-medium">
                        {table.relationships.length} relations
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table Details */}
                {(isExpanded || selectedTable === table.id) && (
                  <div className="p-6">
                    {/* Fields */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-[rgb(15,23,42)] mb-3 flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Fields ({table.fields.length})
                      </h4>
                      <div className="space-y-2">
                        {table.fields.map((field) => (
                          <div
                            key={field.id}
                            className="flex items-center justify-between p-3 bg-[rgb(248,250,252)] rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-[rgb(15,23,42)]">{field.name}</span>
                              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${TYPE_COLORS[field.type]}`}>
                                {field.type}
                              </span>
                              {field.primaryKey && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-md text-xs font-medium">
                                  PK
                                </span>
                              )}
                              {field.foreignKey && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-md text-xs font-medium">
                                  FK
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {field.required && (
                                <span className="text-red-500 text-xs">Required</span>
                              )}
                              {field.unique && (
                                <span className="text-purple-500 text-xs">Unique</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Relationships */}
                    {table.relationships.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-[rgb(15,23,42)] mb-3 flex items-center gap-2">
                          <Link className="w-4 h-4" />
                          Relationships ({table.relationships.length})
                        </h4>
                        <div className="space-y-2">
                          {table.relationships.map((rel) => (
                            <div
                              key={rel.id}
                              className="flex items-center justify-between p-3 bg-[rgb(248,250,252)] rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-[rgb(15,23,42)]">
                                  {rel.fromTable} → {rel.toTable}
                                </span>
                                <span className={`px-2 py-1 rounded-md text-xs font-medium border ${RELATIONSHIP_COLORS[rel.type]}`}>
                                  {rel.type}
                                </span>
                              </div>
                              <span className="text-sm text-[rgb(100,116,139)]">{rel.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-[rgb(100,116,139)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[rgb(15,23,42)] mb-2">No tables found</h3>
            <p className="text-[rgb(100,116,139)]">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RSVPDBSchemaDemo() {
  const [expandedTables, setExpandedTables] = useState<string[]>([])

  const handleTableToggle = (tableId: string) => {
    setExpandedTables(prev =>
      prev.includes(tableId)
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    )
  }

  return (
    <RSVPDBSchema
      expandedTables={expandedTables}
      onTableToggle={handleTableToggle}
    />
  )
}