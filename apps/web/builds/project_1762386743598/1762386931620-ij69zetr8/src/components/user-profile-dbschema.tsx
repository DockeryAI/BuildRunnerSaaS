'use client'

import { useState, useEffect } from 'react'
import { User, Database, Table, Key, FileText, Shield, Calendar, MapPin, Users, MessageSquare, Utensils, CheckSquare } from 'lucide-react'

interface TableSchema {
  id: string
  name: string
  description: string
  columns: ColumnSchema[]
  relationships: RelationshipSchema[]
}

interface ColumnSchema {
  id: string
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
  foreignKey?: string
  description: string
}

interface RelationshipSchema {
  id: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  fromTable: string
  toTable: string
  description: string
}

interface UserProfileDBSchemaProps {
  onSchemaUpdate?: (schema: TableSchema[]) => void
  readOnly?: boolean
}

export function UserProfileDBSchema({
  onSchemaUpdate = () => console.log('Schema updated'),
  readOnly = false
}: UserProfileDBSchemaProps = {}) {
  const [selectedTable, setSelectedTable] = useState<string>('users')
  const [schema, setSchema] = useState<TableSchema[]>(DEFAULT_SCHEMA)
  const [activeTab, setActiveTab] = useState<'tables' | 'relationships' | 'security'>('tables')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onSchemaUpdate(schema)
  }, [schema, onSchemaUpdate])

  const getTableIcon = (tableName: string) => {
    const iconMap: Record<string, any> = {
      users: User,
      trips: MapPin,
      trip_members: Users,
      tasks: CheckSquare,
      messages: MessageSquare,
      meals: Utensils,
      rsvps: Calendar,
      locations: MapPin
    }
    return iconMap[tableName] || Table
  }

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'uuid': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
      'text': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      'varchar': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      'timestamp': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      'boolean': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
      'integer': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      'decimal': 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
      'jsonb': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800'
    }
    return colorMap[type] || 'bg-muted text-mutedForeground border-border dark:bg-muted dark:text-mutedForeground dark:border-border'
  }

  const selectedTableData = schema.find(table => table.id === selectedTable)

  return (
    <div className="min-h-screen bg-background dark:bg-background transition-colors duration-300" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 transition-all duration-300 hover:bg-primary/20">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Database Schema</h1>
              <p className="text-mutedForeground">Off-Road Trip Planning System</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-surface p-1 rounded-lg border border-border shadow-sm">
            {[
              { id: 'tables', label: 'Tables', icon: Table },
              { id: 'relationships', label: 'Relationships', icon: FileText },
              { id: 'security', label: 'Security', icon: Shield }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                    activeTab === tab.id
                      ? 'bg-primary text-primaryForeground shadow-md'
                      : 'text-mutedForeground hover:text-foreground hover:bg-muted'
                  }`}
                  aria-label={`Switch to ${tab.label} tab`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tables Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-foreground mb-4">Tables</h3>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted rounded-lg"></div>
                    ))}
                  </div>
                ) : schema.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Table className="w-6 h-6 text-mutedForeground" />
                    </div>
                    <p className="text-sm text-mutedForeground">No tables found</p>
                  </div>
                ) : (
                  schema.map(table => {
                    const Icon = getTableIcon(table.id)
                    return (
                      <button
                        key={table.id}
                        onClick={() => setSelectedTable(table.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                          selectedTable === table.id
                            ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                            : 'text-mutedForeground hover:bg-muted hover:text-foreground'
                        }`}
                        aria-label={`Select ${table.name} table`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium truncate">{table.name}</div>
                          <div className="text-xs text-mutedForeground truncate">{table.columns.length} columns</div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {activeTab === 'tables' && selectedTableData && (
              <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                    {(() => {
                      const Icon = getTableIcon(selectedTableData.id)
                      return <Icon className="w-5 h-5 text-primary" />
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedTableData.name}</h2>
                    <p className="text-mutedForeground">{selectedTableData.description}</p>
                  </div>
                </div>

                {/* Columns */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-foreground font-medium">Column</th>
                        <th className="text-left py-3 px-4 text-foreground font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-foreground font-medium">Constraints</th>
                        <th className="text-left py-3 px-4 text-foreground font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTableData.columns.map(column => (
                        <tr key={column.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors duration-150">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {column.primaryKey && <Key className="w-4 h-4 text-accent" />}
                              <span className="text-foreground font-medium">{column.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(column.type)}`}>
                              {column.type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 flex-wrap">
                              {column.primaryKey && (
                                <span className="px-2 py-1 bg-accent/10 text-accent rounded-md text-xs font-medium border border-accent/20">
                                  PK
                                </span>
                              )}
                              {column.foreignKey && (
                                <span className="px-2 py-1 bg-secondary/10 text-secondary rounded-md text-xs font-medium border border-secondary/20">
                                  FK
                                </span>
                              )}
                              {!column.nullable && (
                                <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-md text-xs font-medium border border-destructive/20">
                                  NOT NULL
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-mutedForeground text-sm">{column.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'relationships' && (
              <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h2 className="text-xl font-bold text-foreground mb-6">Table Relationships</h2>
                <div className="space-y-4">
                  {schema.flatMap(table => table.relationships).length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-mutedForeground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">No relationships defined</h3>
                      <p className="text-mutedForeground text-sm">Table relationships will appear here when configured</p>
                    </div>
                  ) : (
                    schema.flatMap(table => table.relationships).map(rel => (
                      <div key={rel.id} className="bg-muted/30 rounded-lg p-4 border border-border hover:bg-muted/50 transition-all duration-150">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-foreground font-medium">{rel.fromTable}</span>
                            <div className="flex items-center gap-1 text-mutedForeground">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <div className="w-8 h-px bg-border"></div>
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            </div>
                            <span className="text-foreground font-medium">{rel.toTable}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                            rel.type === 'one-to-one' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                            rel.type === 'one-to-many' ? 'bg-primary/10 text-primary border-primary/20' :
                            'bg-accent/10 text-accent border-accent/20'
                          }`}>
                            {rel.type}
                          </span>
                        </div>
                        <p className="text-mutedForeground text-sm">{rel.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h2 className="text-xl font-bold text-foreground mb-6">Security Policies</h2>
                <div className="space-y-4">
                  {SECURITY_POLICIES.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-mutedForeground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">No security policies</h3>
                      <p className="text-mutedForeground text-sm">Security policies will appear here when configured</p>
                    </div>
                  ) : (
                    SECURITY_POLICIES.map(policy => (
                      <div key={policy.id} className="bg-muted/30 rounded-lg p-4 border border-border hover:bg-muted/50 transition-all duration-150">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-foreground font-medium">{policy.name}</h3>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                            policy.level === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            policy.level === 'medium' ? 'bg-accent/10 text-accent border-accent/20' :
                            'bg-primary/10 text-primary border-primary/20'
                          }`}>
                            {policy.level}
                          </span>
                        </div>
                        <p className="text-mutedForeground text-sm mb-2">{policy.description}</p>
                        <div className="text-xs text-mutedForeground">
                          <span className="font-medium">Tables:</span> {policy.tables.join(', ')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const DEFAULT_SCHEMA: TableSchema[] = [
  {
    id: 'users',
    name: 'users',
    description: 'User profiles and authentication data',
    columns: [
      { id: 'id', name: 'id', type: 'uuid', nullable: false, primaryKey: true, description: 'Unique user identifier' },
      { id: 'email', name: 'email', type: 'varchar', nullable: false, primaryKey: false, description: 'User email address' },
      { id: 'full_name', name: 'full_name', type: 'text', nullable: true, primaryKey: false, description: 'User full name' },
      { id: 'avatar_url', name: 'avatar_url', type: 'text', nullable: true, primaryKey: false, description: 'Profile picture URL' },
      { id: 'phone', name: 'phone', type: 'varchar', nullable: true, primaryKey: false, description: 'Phone number' },
      { id: 'emergency_contact', name: 'emergency_contact', type: 'jsonb', nullable: true, primaryKey: false, description: 'Emergency contact information' },
      { id: 'vehicle_info', name: 'vehicle_info', type: 'jsonb', nullable: true, primaryKey: false, description: 'Vehicle details and capabilities' },
      { id: 'experience_level', name: 'experience_level', type: 'varchar', nullable: true, primaryKey: false, description: 'Off-roading experience level' },
      { id: 'created_at', name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Account creation timestamp' },
      { id: 'updated_at', name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Last profile update' }
    ],
    relationships: [
      { id: 'user_trips', type: 'one-to-many', fromTable: 'users', toTable: 'trip_members', description: 'User can be member of multiple trips' },
      { id: 'user_messages', type: 'one-to-many', fromTable: 'users', toTable: 'messages', description: 'User can send multiple messages' }
    ]
  },
  {
    id: 'trips',
    name: 'trips',
    description: 'Off-road trip planning and details',
    columns: [
      { id: 'id', name: 'id', type: 'uuid', nullable: false, primaryKey: true, description: 'Unique trip identifier' },
      { id: 'title', name: 'title', type: 'text', nullable: false, primaryKey: false, description: 'Trip name/title' },
      { id: 'description', name: 'description', type: 'text', nullable: true, primaryKey: false, description: 'Trip description and details' },
      { id: 'start_date', name: 'start_date', type: 'timestamp', nullable: false, primaryKey: false, description: 'Trip start date and time' },
      { id: 'end_date', name: 'end_date', type: 'timestamp', nullable: false, primaryKey: false, description: 'Trip end date and time' },
      { id: 'location_id', name: 'location_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: 'locations.id', description: 'Primary trip location' },
      { id: 'organizer_id', name: 'organizer_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: 'users.id', description: 'Trip organizer' },
      { id: 'max_participants', name: 'max_participants', type: 'integer', nullable: true, primaryKey: false, description: 'Maximum number of participants' },
      { id: 'difficulty_level', name: 'difficulty_level', type: 'varchar', nullable: false, primaryKey: false, description: 'Trail difficulty rating' },
      { id: 'requirements', name: 'requirements', type: 'jsonb', nullable: true, primaryKey: false, description: 'Vehicle and gear requirements' },
      { id: 'weather_data', name: 'weather_data', type: 'jsonb', nullable: true, primaryKey: false, description: 'Cached weather forecast' },
      { id: 'status', name: 'status', type: 'varchar', nullable: false, primaryKey: false, description: 'Trip status (planning, confirmed, completed, cancelled)' },
      { id: 'created_at', name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Trip creation timestamp' },
      { id: 'updated_at', name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Last trip update' }
    ],
    relationships: [
      { id: 'trip_location', type: 'many-to-one', fromTable: 'trips', toTable: 'locations', description: 'Trip has a primary location' },
      { id: 'trip_organizer', type: 'many-to-one', fromTable: 'trips', toTable: 'users', description: 'Trip has an organizer' },
      { id: 'trip_participants', type: 'one-to-many', fromTable: 'trips', toTable: 'trip_members', description: 'Trip can have multiple participants' }
    ]
  },
  {
    id: 'locations',
    name: 'locations',
    description: 'Saved off-road locations and trails',
    columns: [
      { id: 'id', name: 'id', type: 'uuid', nullable: false, primaryKey: true, description: 'Unique location identifier' },
      { id: 'name', name: 'name', type: 'text', nullable: false, primaryKey: false, description: 'Location name' },
      { id: 'description', name: 'description', type: 'text', nullable: true, primaryKey: false, description: 'Location description' },
      { id: 'latitude', name: 'latitude', type: 'decimal', nullable: false, primaryKey: false, description: 'GPS latitude coordinate' },
      { id: 'longitude', name: 'longitude', type: 'decimal', nullable: false, primaryKey: false, description: 'GPS longitude coordinate' },
      { id: 'trail_type', name: 'trail_type', type: 'varchar', nullable: false, primaryKey: false, description: 'Type of trail (rock crawling, sand, mud, etc.)' },
      { id: 'difficulty_rating', name: 'difficulty_rating', type: 'integer', nullable: false, primaryKey: false, description: 'Difficulty rating 1-10' },
      { id: 'amenities', name: 'amenities', type: 'jsonb', nullable: true, primaryKey: false, description: 'Available amenities (restrooms, camping, etc.)' },
      { id: 'access_requirements', name: 'access_requirements', type: 'jsonb', nullable: true, primaryKey: false, description: 'Permits, fees, restrictions' },
      { id: 'created_by', name: 'created_by', type: 'uuid', nullable: false, primaryKey: false, foreignKey: 'users.id', description: 'User who added location' },
      { id: 'is_public', name: 'is_public', type: 'boolean', nullable: false, primaryKey: false, description: 'Whether location is publicly visible' },
      { id: 'created_at', name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Location creation timestamp' }
    ],
    relationships: [
      { id: 'location_creator', type: 'many-to-one', fromTable: 'locations', toTable: 'users', description: 'Location has a creator' },
      { id: 'location_trips', type: 'one-to-many', fromTable: 'locations', toTable: 'trips', description: 'Location can be used for multiple trips' }
    ]
  },
  {
    id: 'trip_members',
    name: 'trip_members',
    description: 'Trip participants and their roles',
    columns: [
      { id: 'id', name: 'id', type: 'uuid', nullable: false, primaryKey: true, description: 'Unique membership identifier' },
      { id: 'trip_id', name: 'trip_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: 'trips.id', description: 'Associated trip' },
      { id: 'user_id', name: 'user_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: 'users.id', description: 'Trip participant' },
      { id: 'role', name: 'role', type: 'varchar', nullable: false, primaryKey: false, description: 'Member role (organizer, participant, guide)' },
      { id: 'status', name: 'status', type: 'varchar', nullable: false, primaryKey: false, description: 'RSVP status (pending, confirmed, declined)' },
      { id: 'invited_at', name: 'invited_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Invitation timestamp' },
      { id: 'responded_at', name: 'responded_at', type: 'timestamp', nullable: true, primaryKey: false, description: 'RSVP response timestamp' },
      { id: 'notes', name: 'notes', type: 'text', nullable: true, primaryKey: false, description: 'Member-specific notes or requirements' }
    ],
    relationships: [
      { id: 'member_trip', type: 'many-to-one', fromTable: 'trip_members', toTable: 'trips', description: 'Member belongs to a trip' },
      { id: 'member_user', type: 'many-to-one', fromTable: 'trip_members', toTable: 'users', description: 'Member is a user' }
    ]
  },
  {
    id: 'tasks',
    name: 'tasks',
    description: 'Trip preparation and coordination tasks',
    columns: [
      { id: 'id', name: 'id', type: 'uuid', nullable: false, primaryKey: true, description: 'Unique task identifier' },
      { id: 'trip_id', name: 'trip_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: 'trips.id', description: 'Associated trip' },
      { id: 'title', name: 'title', type: 'text', nullable: false, primaryKey: false, description: 'Task title' },
      { id: 'description', name: 'description', type: 'text', nullable: true, primaryKey: false, description: 'Task description and details' },
      { id: 'assigned_to', name: 'assigned_to', type: 'uuid', nullable: true, primaryKey: false, foreignKey: 'users.id', description: 'Assigned user' },
      { id: 'category', name: 'category', type: 'varchar', nullable: false, primaryKey: false, description: 'Task category (food, gear, logistics, etc.)' },
      { id: 'priority', name: 'priority', type: 'varchar', nullable: false, primaryKey: false, description: 'Task priority (low, medium, high, critical)' },
      { id: 'due_date', name: 'due_date', type: 'timestamp', nullable: true, primaryKey: false, description: 'Task due date' },
      { id: 'status', name: 'status', type: 'varchar', nullable: false, primaryKey: false, description: 'Task status (pending, in_progress, completed)' },
      { id: 'created_by', name: 'created_by', type: 'uuid', nullable: false, primaryKey: false, foreignKey: 'users.id', description: 'Task creator' },
      { id: 'created_at', name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Task creation timestamp' },
      { id: 'completed_at', name: 'completed_at', type: 'timestamp', nullable: true, primaryKey: false, description: 'Task completion timestamp' }
    ],
    relationships: [
      { id: 'task_trip', type: 'many-to-one', fromTable: 'tasks', toTable: 'trips', description: 'Task belongs to a trip' },
      { id: 'task_assignee', type: 'many-to-one', fromTable: 'tasks', toTable: 'users', description: 'Task has an assignee' },
      { id: 'task_creator', type: 'many-to-one', fromTable: 'tasks', toTable: 'users', description: 'Task has a creator' }
    ]
  },
  {
    id: 'meals',
    name: 'meals',
    description: 'Trip meal planning and coordination',
    columns: [
      { id: 'id', name: 'id', type: 'uuid', nullable: false, primaryKey: true, description: 'Unique meal identifier' },
      { id: 'trip_id', name: 'trip_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: 'trips.id', description: 'Associated trip' },
      { id: 'name', name: 'name', type: 'text', nullable: false, primaryKey: false, description: 'Meal name' },
      { id: 'meal_type', name: 'meal_type', type: 'varchar', nullable: false, primaryKey: false, description: 'Type of meal (breakfast, lunch, dinner, snack)' },
      { id: 'scheduled_date', name: 'scheduled_date', type: 'timestamp', nullable: false, primaryKey: false, description: 'When meal is scheduled' },
      { id: 'description', name: 'description', type: 'text', nullable: true, primaryKey: false, description: 'Meal description and details' },
      { id: 'ingredients', name: 'ingredients', type: 'jsonb', nullable: true, primaryKey: false, description: 'Required ingredients list' },
      { id: 'cooking_instructions', name: 'cooking_instructions', type: 'text', nullable: true, primaryKey: false, description: 'Cooking instructions' },
      { id: 'assigned_cook', name: 'assigned_cook', type: 'uuid', nullable: true, primaryKey: false, foreignKey: 'users.id', description: 'Assigned cook' },
      { id: 'serves_count', name: 'serves_count', type: 'integer', nullable: false, primaryKey: false, description: 'Number of people served' },
      { id: 'dietary_restrictions', name: 'dietary_restrictions', type: 'jsonb', nullable: true, primaryKey: false, description: 'Dietary considerations' },
      { id: 'created_at', name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Meal planning timestamp' }
    ],
    relationships: [
      { id: 'meal_trip', type: 'many-to-one', fromTable: 'meals', toTable: 'trips', description: 'Meal belongs to a trip' },
      { id: 'meal_cook', type: 'many-to-one', fromTable: 'meals', toTable: 'users', description: 'Meal has an assigned cook' }
    ]
  },
  {
    id: 'messages',
    name: 'messages',
    description: 'Trip group chat and communication',
    columns: [
      { id: 'id', name: 'id', type: 'uuid', nullable: false, primaryKey: true, description: 'Unique message identifier' },
      { id: 'trip_id', name: 'trip_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: 'trips.id', description: 'Associated trip' },
      { id: 'sender_id', name: 'sender_id', type: 'uuid', nullable: false, primaryKey: false, foreignKey: 'users.id', description: 'Message sender' },
      { id: 'content', name: 'content', type: 'text', nullable: false, primaryKey: false, description: 'Message content' },
      { id: 'message_type', name: 'message_type', type: 'varchar', nullable: false, primaryKey: false, description: 'Type of message (text, image, location, system)' },
      { id: 'attachments', name: 'attachments', type: 'jsonb', nullable: true, primaryKey: false, description: 'File attachments metadata' },
      { id: 'reply_to', name: 'reply_to', type: 'uuid', nullable: true, primaryKey: false, foreignKey: 'messages.id', description: 'Message being replied to' },
      { id: 'is_system', name: 'is_system', type: 'boolean', nullable: false, primaryKey: false, description: 'Whether message is system-generated' },
      { id: 'created_at', name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Message timestamp' },
      { id: 'edited_at', name: 'edited_at', type: 'timestamp', nullable: true, primaryKey: false, description: 'Last edit timestamp' }
    ],
    relationships: [
      { id: 'message_trip', type: 'many-to-one', fromTable: 'messages', toTable: 'trips', description: 'Message belongs to a trip' },
      { id: 'message_sender', type: 'many-to-one', fromTable: 'messages', toTable: 'users', description: 'Message has a sender' },
      { id: 'message_reply', type: 'many-to-one', fromTable: 'messages', toTable: 'messages', description: 'Message can be a reply' }
    ]
  }
]

const SECURITY_POLICIES = [
  {
    id: 'rls_users',
    name: 'Row Level Security - Users',
    description: 'Users can only view and edit their own profile data',
    level: 'high' as const,
    tables: ['users']
  },
  {
    id: 'trip_access',
    name: 'Trip Access Control',
    description: 'Users can only access trips they are members of or have been invited to',
    level: 'high' as const,
    tables: ['trips', 'trip_members', 'tasks', 'meals', 'messages']
  },
  {
    id: 'location_privacy',
    name: 'Location Privacy',
    description: 'Private locations only visible to creator unless shared with trip',
    level: 'medium' as const,
    tables: ['locations']
  },
  {
    id: 'message_encryption',
    name: 'Message Encryption',
    description: 'All trip communications are encrypted at rest and in transit',
    level: 'high' as const,
    tables: ['messages']
  },
  {
    id: 'audit_logging',
    name: 'Audit Trail',
    description: 'All data modifications are logged for security and compliance',
    level: 'medium' as const,
    tables: ['users', 'trips', 'locations', 'tasks']
  }
]

export default function UserProfileDBSchemaDemo() {
  return <UserProfileDBSchema />
}