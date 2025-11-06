'use client'

import { useState } from 'react'
import { Database, Table, Key, Link, FileText, Users, MapPin, Calendar, MessageSquare, Utensils, CloudRain } from 'lucide-react'

interface TableSchema {
  id: string
  name: string
  description: string
  columns: Column[]
  relationships: Relationship[]
}

interface Column {
  id: string
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
  foreignKey?: string
}

interface Relationship {
  id: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  fromTable: string
  toTable: string
  description: string
}

interface TripDBSchemaProps {
  onTableSelect?: (tableId: string) => void
  showRelationships?: boolean
}

export function TripDBSchema({
  onTableSelect = () => console.log('Table selected'),
  showRelationships = true
}: TripDBSchemaProps = {}) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'visual' | 'list'>('visual')

  const handleTableClick = (tableId: string) => {
    setSelectedTable(tableId)
    onTableSelect(tableId)
  }

  const getTableIcon = (tableName: string) => {
    const iconMap: Record<string, any> = {
      trips: MapPin,
      users: Users,
      locations: MapPin,
      tasks: FileText,
      invitations: Calendar,
      messages: MessageSquare,
      meals: Utensils,
      weather: CloudRain
    }
    const IconComponent = iconMap[tableName.toLowerCase()] || Table
    return <IconComponent className="w-5 h-5" />
  }

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'one-to-one': return 'border-primary'
      case 'one-to-many': return 'border-accent'
      case 'many-to-many': return 'border-secondary'
      default: return 'border-border'
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Trip Planning Database Schema</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-mutedForeground text-lg leading-relaxed">
              Complete database structure for off-road trip planning and management
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  viewMode === 'visual'
                    ? 'bg-primary text-primaryForeground shadow-md'
                    : 'bg-surface text-foreground hover:bg-muted border border-border'
                }`}
                aria-label="Switch to visual view"
              >
                Visual
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  viewMode === 'list'
                    ? 'bg-primary text-primaryForeground shadow-md'
                    : 'bg-surface text-foreground hover:bg-muted border border-border'
                }`}
                aria-label="Switch to list view"
              >
                List
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'visual' ? (
          /* Visual Schema View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SCHEMA_TABLES.map((table) => (
              <div
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                className={`bg-surface rounded-xl border p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  selectedTable === table.id
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
                tabIndex={0}
                role="button"
                aria-label={`Select ${table.name} table`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleTableClick(table.id)
                  }
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  {getTableIcon(table.name)}
                  <h3 className="text-xl font-semibold text-foreground">{table.name}</h3>
                </div>
                
                <p className="text-mutedForeground text-sm mb-4 leading-normal">{table.description}</p>
                
                <div className="space-y-2">
                  {table.columns.slice(0, 4).map((column) => (
                    <div key={column.id} className="flex items-center gap-2 text-sm">
                      {column.primaryKey && <Key className="w-3 h-3 text-accent" />}
                      {column.foreignKey && <Link className="w-3 h-3 text-secondary" />}
                      <span className={`${column.primaryKey ? 'text-accent' : column.foreignKey ? 'text-secondary' : 'text-foreground'} font-medium`}>
                        {column.name}
                      </span>
                      <span className="text-mutedForeground">({column.type})</span>
                    </div>
                  ))}
                  {table.columns.length > 4 && (
                    <div className="text-xs text-mutedForeground">
                      +{table.columns.length - 4} more columns
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-6">
            {SCHEMA_TABLES.map((table) => (
              <div
                key={table.id}
                className="bg-surface rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  {getTableIcon(table.name)}
                  <h3 className="text-2xl font-semibold text-foreground">{table.name}</h3>
                </div>
                
                <p className="text-mutedForeground mb-6 leading-relaxed">{table.description}</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Columns */}
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-3">Columns</h4>
                    <div className="space-y-2">
                      {table.columns.map((column) => (
                        <div key={column.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg transition-all duration-200 hover:bg-muted/80">
                          <div className="flex items-center gap-2">
                            {column.primaryKey && <Key className="w-4 h-4 text-accent" />}
                            {column.foreignKey && <Link className="w-4 h-4 text-secondary" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-medium ${column.primaryKey ? 'text-accent' : column.foreignKey ? 'text-secondary' : 'text-foreground'}`}>
                                {column.name}
                              </span>
                              <span className="text-mutedForeground text-sm">({column.type})</span>
                              {!column.nullable && (
                                <span className="text-destructive text-xs font-medium px-2 py-1 bg-destructive/10 rounded">NOT NULL</span>
                              )}
                            </div>
                            {column.foreignKey && (
                              <div className="text-xs text-secondary mt-1">
                                References: {column.foreignKey}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Relationships */}
                  <div>
                    <h4 className="text-lg font-medium text-foreground mb-3">Relationships</h4>
                    <div className="space-y-2">
                      {table.relationships.map((rel) => (
                        <div key={rel.id} className={`p-3 bg-muted rounded-lg border-l-4 ${getRelationshipColor(rel.type)} transition-all duration-200 hover:bg-muted/80`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-foreground font-medium capitalize">{rel.type.replace('-', ' ')}</span>
                            <span className="text-mutedForeground text-sm">
                              {rel.fromTable} → {rel.toTable}
                            </span>
                          </div>
                          <p className="text-mutedForeground text-sm leading-normal">{rel.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Relationship Legend */}
        {showRelationships && (
          <div className="mt-8 bg-surface rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Relationship Types</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-1 bg-primary rounded"></div>
                <span className="text-foreground">One-to-One</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-1 bg-accent rounded"></div>
                <span className="text-foreground">One-to-Many</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-1 bg-secondary rounded"></div>
                <span className="text-foreground">Many-to-Many</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock schema data
const SCHEMA_TABLES: TableSchema[] = [
  {
    id: 'trips',
    name: 'trips',
    description: 'Main trip planning and management table',
    columns: [
      { id: 'trip_id', name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { id: 'trip_name', name: 'name', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
      { id: 'trip_description', name: 'description', type: 'TEXT', nullable: true, primaryKey: false },
      { id: 'trip_start_date', name: 'start_date', type: 'TIMESTAMP', nullable: false, primaryKey: false },
      { id: 'trip_end_date', name: 'end_date', type: 'TIMESTAMP', nullable: false, primaryKey: false },
      { id: 'trip_creator_id', name: 'creator_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'users.id' },
      { id: 'trip_location_id', name: 'location_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'locations.id' },
      { id: 'trip_status', name: 'status', type: 'ENUM', nullable: false, primaryKey: false },
      { id: 'trip_created_at', name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false },
      { id: 'trip_updated_at', name: 'updated_at', type: 'TIMESTAMP', nullable: false, primaryKey: false }
    ],
    relationships: [
      { id: 'trip_creator', type: 'many-to-one', fromTable: 'trips', toTable: 'users', description: 'Trip creator relationship' },
      { id: 'trip_location', type: 'many-to-one', fromTable: 'trips', toTable: 'locations', description: 'Trip location relationship' },
      { id: 'trip_participants', type: 'one-to-many', fromTable: 'trips', toTable: 'trip_participants', description: 'Trip participants' }
    ]
  },
  {
    id: 'users',
    name: 'users',
    description: 'User profiles and authentication data',
    columns: [
      { id: 'user_id', name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { id: 'user_email', name: 'email', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
      { id: 'user_name', name: 'name', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
      { id: 'user_phone', name: 'phone', type: 'VARCHAR(20)', nullable: true, primaryKey: false },
      { id: 'user_avatar_url', name: 'avatar_url', type: 'TEXT', nullable: true, primaryKey: false },
      { id: 'user_preferences', name: 'preferences', type: 'JSONB', nullable: true, primaryKey: false },
      { id: 'user_created_at', name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false },
      { id: 'user_updated_at', name: 'updated_at', type: 'TIMESTAMP', nullable: false, primaryKey: false }
    ],
    relationships: [
      { id: 'user_trips', type: 'one-to-many', fromTable: 'users', toTable: 'trips', description: 'Created trips' },
      { id: 'user_participations', type: 'one-to-many', fromTable: 'users', toTable: 'trip_participants', description: 'Trip participations' }
    ]
  },
  {
    id: 'locations',
    name: 'locations',
    description: 'Saved off-road locations and waypoints',
    columns: [
      { id: 'location_id', name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { id: 'location_name', name: 'name', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
      { id: 'location_description', name: 'description', type: 'TEXT', nullable: true, primaryKey: false },
      { id: 'location_latitude', name: 'latitude', type: 'DECIMAL(10,8)', nullable: false, primaryKey: false },
      { id: 'location_longitude', name: 'longitude', type: 'DECIMAL(11,8)', nullable: false, primaryKey: false },
      { id: 'location_difficulty', name: 'difficulty', type: 'ENUM', nullable: true, primaryKey: false },
      { id: 'location_type', name: 'type', type: 'ENUM', nullable: false, primaryKey: false },
      { id: 'location_created_by', name: 'created_by', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'users.id' }
    ],
    relationships: [
      { id: 'location_creator', type: 'many-to-one', fromTable: 'locations', toTable: 'users', description: 'Location creator' },
      { id: 'location_trips', type: 'one-to-many', fromTable: 'locations', toTable: 'trips', description: 'Trips at this location' }
    ]
  },
  {
    id: 'trip_participants',
    name: 'trip_participants',
    description: 'Junction table for trip members and their roles',
    columns: [
      { id: 'participant_id', name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { id: 'participant_trip_id', name: 'trip_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'trips.id' },
      { id: 'participant_user_id', name: 'user_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'users.id' },
      { id: 'participant_role', name: 'role', type: 'ENUM', nullable: false, primaryKey: false },
      { id: 'participant_status', name: 'status', type: 'ENUM', nullable: false, primaryKey: false },
      { id: 'participant_joined_at', name: 'joined_at', type: 'TIMESTAMP', nullable: false, primaryKey: false }
    ],
    relationships: [
      { id: 'participant_trip', type: 'many-to-one', fromTable: 'trip_participants', toTable: 'trips', description: 'Participant trip' },
      { id: 'participant_user', type: 'many-to-one', fromTable: 'trip_participants', toTable: 'users', description: 'Participant user' }
    ]
  },
  {
    id: 'tasks',
    name: 'tasks',
    description: 'Trip tasks and assignments (firewood, lunch, etc.)',
    columns: [
      { id: 'task_id', name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { id: 'task_trip_id', name: 'trip_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'trips.id' },
      { id: 'task_title', name: 'title', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
      { id: 'task_description', name: 'description', type: 'TEXT', nullable: true, primaryKey: false },
      { id: 'task_assigned_to', name: 'assigned_to', type: 'UUID', nullable: true, primaryKey: false, foreignKey: 'users.id' },
      { id: 'task_due_date', name: 'due_date', type: 'TIMESTAMP', nullable: true, primaryKey: false },
      { id: 'task_status', name: 'status', type: 'ENUM', nullable: false, primaryKey: false },
      { id: 'task_priority', name: 'priority', type: 'ENUM', nullable: false, primaryKey: false }
    ],
    relationships: [
      { id: 'task_trip', type: 'many-to-one', fromTable: 'tasks', toTable: 'trips', description: 'Task trip' },
      { id: 'task_assignee', type: 'many-to-one', fromTable: 'tasks', toTable: 'users', description: 'Task assignee' }
    ]
  },
  {
    id: 'meals',
    name: 'meals',
    description: 'Meal planning and menu management',
    columns: [
      { id: 'meal_id', name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { id: 'meal_trip_id', name: 'trip_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'trips.id' },
      { id: 'meal_name', name: 'name', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
      { id: 'meal_type', name: 'type', type: 'ENUM', nullable: false, primaryKey: false },
      { id: 'meal_date', name: 'date', type: 'DATE', nullable: false, primaryKey: false },
      { id: 'meal_ingredients', name: 'ingredients', type: 'JSONB', nullable: true, primaryKey: false },
      { id: 'meal_instructions', name: 'instructions', type: 'TEXT', nullable: true, primaryKey: false },
      { id: 'meal_assigned_to', name: 'assigned_to', type: 'UUID', nullable: true, primaryKey: false, foreignKey: 'users.id' }
    ],
    relationships: [
      { id: 'meal_trip', type: 'many-to-one', fromTable: 'meals', toTable: 'trips', description: 'Meal trip' },
      { id: 'meal_cook', type: 'many-to-one', fromTable: 'meals', toTable: 'users', description: 'Meal cook' }
    ]
  },
  {
    id: 'messages',
    name: 'messages',
    description: 'Group chat and communication',
    columns: [
      { id: 'message_id', name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { id: 'message_trip_id', name: 'trip_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'trips.id' },
      { id: 'message_user_id', name: 'user_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'users.id' },
      { id: 'message_content', name: 'content', type: 'TEXT', nullable: false, primaryKey: false },
      { id: 'message_type', name: 'type', type: 'ENUM', nullable: false, primaryKey: false },
      { id: 'message_created_at', name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false },
      { id: 'message_edited_at', name: 'edited_at', type: 'TIMESTAMP', nullable: true, primaryKey: false }
    ],
    relationships: [
      { id: 'message_trip', type: 'many-to-one', fromTable: 'messages', toTable: 'trips', description: 'Message trip' },
      { id: 'message_author', type: 'many-to-one', fromTable: 'messages', toTable: 'users', description: 'Message author' }
    ]
  },
  {
    id: 'weather',
    name: 'weather',
    description: 'Weather data and forecasts for trip locations',
    columns: [
      { id: 'weather_id', name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { id: 'weather_trip_id', name: 'trip_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'trips.id' },
      { id: 'weather_date', name: 'date', type: 'DATE', nullable: false, primaryKey: false },
      { id: 'weather_temperature_high', name: 'temperature_high', type: 'INTEGER', nullable: true, primaryKey: false },
      { id: 'weather_temperature_low', name: 'temperature_low', type: 'INTEGER', nullable: true, primaryKey: false },
      { id: 'weather_conditions', name: 'conditions', type: 'VARCHAR(100)', nullable: true, primaryKey: false },
      { id: 'weather_precipitation', name: 'precipitation', type: 'DECIMAL(5,2)', nullable: true, primaryKey: false },
      { id: 'weather_wind_speed', name: 'wind_speed', type: 'INTEGER', nullable: true, primaryKey: false }
    ],
    relationships: [
      { id: 'weather_trip', type: 'many-to-one', fromTable: 'weather', toTable: 'trips', description: 'Weather for trip' }
    ]
  }
]

// Demo component for page.tsx
export default function TripDBSchemaDemo() {
  return <TripDBSchema />
}