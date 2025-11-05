'use client'

import { useState, useEffect } from 'react'
import { Database, Table, Key, Link, FileText, Users, Calendar, MapPin, MessageSquare, Utensils, CheckSquare } from 'lucide-react'

interface TableSchema {
  name: string
  description: string
  columns: Column[]
  relationships: Relationship[]
}

interface Column {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
  foreignKey?: string
}

interface Relationship {
  type: 'one-to-many' | 'many-to-many' | 'one-to-one'
  target: string
  description: string
}

interface DatabaseSchemaProps {
  showRelationships?: boolean
  expandedTables?: string[]
  onTableSelect?: (tableName: string) => void
}

const SCHEMA_TABLES: TableSchema[] = [
  {
    name: 'users',
    description: 'User accounts and profiles',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { name: 'email', type: 'VARCHAR', nullable: false, primaryKey: false },
      { name: 'display_name', type: 'VARCHAR', nullable: true, primaryKey: false },
      { name: 'avatar_url', type: 'TEXT', nullable: true, primaryKey: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false, primaryKey: false }
    ],
    relationships: [
      { type: 'one-to-many', target: 'trips', description: 'User can create multiple trips' },
      { type: 'many-to-many', target: 'trip_members', description: 'User can join multiple trips' }
    ]
  },
  {
    name: 'trips',
    description: 'Off-road trip planning and details',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { name: 'title', type: 'VARCHAR', nullable: false, primaryKey: false },
      { name: 'description', type: 'TEXT', nullable: true, primaryKey: false },
      { name: 'start_date', type: 'DATE', nullable: false, primaryKey: false },
      { name: 'end_date', type: 'DATE', nullable: false, primaryKey: false },
      { name: 'created_by', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'users.id' },
      { name: 'status', type: 'ENUM', nullable: false, primaryKey: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false }
    ],
    relationships: [
      { type: 'one-to-many', target: 'locations', description: 'Trip can have multiple locations' },
      { type: 'one-to-many', target: 'trip_members', description: 'Trip can have multiple members' },
      { type: 'one-to-many', target: 'tasks', description: 'Trip can have multiple tasks' }
    ]
  },
  {
    name: 'locations',
    description: 'Saved locations and trip destinations',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { name: 'name', type: 'VARCHAR', nullable: false, primaryKey: false },
      { name: 'latitude', type: 'DECIMAL', nullable: false, primaryKey: false },
      { name: 'longitude', type: 'DECIMAL', nullable: false, primaryKey: false },
      { name: 'description', type: 'TEXT', nullable: true, primaryKey: false },
      { name: 'trip_id', type: 'UUID', nullable: true, primaryKey: false, foreignKey: 'trips.id' },
      { name: 'created_by', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'users.id' }
    ],
    relationships: [
      { type: 'many-to-many', target: 'weather_data', description: 'Location weather tracking' }
    ]
  },
  {
    name: 'trip_members',
    description: 'Trip participants and their roles',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { name: 'trip_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'trips.id' },
      { name: 'user_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'users.id' },
      { name: 'role', type: 'ENUM', nullable: false, primaryKey: false },
      { name: 'rsvp_status', type: 'ENUM', nullable: false, primaryKey: false },
      { name: 'invited_at', type: 'TIMESTAMP', nullable: false, primaryKey: false },
      { name: 'responded_at', type: 'TIMESTAMP', nullable: true, primaryKey: false }
    ],
    relationships: [
      { type: 'one-to-many', target: 'task_assignments', description: 'Member can be assigned tasks' }
    ]
  },
  {
    name: 'tasks',
    description: 'Trip tasks and assignments',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { name: 'trip_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'trips.id' },
      { name: 'title', type: 'VARCHAR', nullable: false, primaryKey: false },
      { name: 'description', type: 'TEXT', nullable: true, primaryKey: false },
      { name: 'category', type: 'ENUM', nullable: false, primaryKey: false },
      { name: 'due_date', type: 'TIMESTAMP', nullable: true, primaryKey: false },
      { name: 'status', type: 'ENUM', nullable: false, primaryKey: false },
      { name: 'created_by', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'users.id' }
    ],
    relationships: [
      { type: 'one-to-many', target: 'task_assignments', description: 'Task can be assigned to members' }
    ]
  },
  {
    name: 'meals',
    description: 'Meal planning and menu items',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { name: 'trip_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'trips.id' },
      { name: 'name', type: 'VARCHAR', nullable: false, primaryKey: false },
      { name: 'meal_type', type: 'ENUM', nullable: false, primaryKey: false },
      { name: 'scheduled_date', type: 'DATE', nullable: false, primaryKey: false },
      { name: 'scheduled_time', type: 'TIME', nullable: true, primaryKey: false },
      { name: 'ingredients', type: 'JSONB', nullable: true, primaryKey: false },
      { name: 'assigned_to', type: 'UUID', nullable: true, primaryKey: false, foreignKey: 'users.id' }
    ],
    relationships: []
  },
  {
    name: 'chat_messages',
    description: 'Group chat messages',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { name: 'trip_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'trips.id' },
      { name: 'user_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'users.id' },
      { name: 'message', type: 'TEXT', nullable: false, primaryKey: false },
      { name: 'message_type', type: 'ENUM', nullable: false, primaryKey: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false },
      { name: 'edited_at', type: 'TIMESTAMP', nullable: true, primaryKey: false }
    ],
    relationships: []
  },
  {
    name: 'weather_data',
    description: 'Weather information for locations',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, primaryKey: true },
      { name: 'location_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'locations.id' },
      { name: 'forecast_date', type: 'DATE', nullable: false, primaryKey: false },
      { name: 'temperature_high', type: 'INTEGER', nullable: true, primaryKey: false },
      { name: 'temperature_low', type: 'INTEGER', nullable: true, primaryKey: false },
      { name: 'conditions', type: 'VARCHAR', nullable: true, primaryKey: false },
      { name: 'precipitation_chance', type: 'INTEGER', nullable: true, primaryKey: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false, primaryKey: false }
    ],
    relationships: []
  }
]

const getTableIcon = (tableName: string) => {
  const iconMap: Record<string, any> = {
    users: Users,
    trips: MapPin,
    locations: MapPin,
    trip_members: Users,
    tasks: CheckSquare,
    meals: Utensils,
    chat_messages: MessageSquare,
    weather_data: Calendar
  }
  return iconMap[tableName] || Table
}

const getTypeColor = (type: string) => {
  if (type === 'UUID') return 'text-[rgb(34, 139, 34)] bg-blue-50'
  if (type.includes('VARCHAR') || type === 'TEXT') return 'text-green-600 bg-green-50'
  if (type.includes('INT') || type === 'DECIMAL') return 'text-purple-600 bg-purple-50'
  if (type === 'TIMESTAMP' || type === 'DATE' || type === 'TIME') return 'text-orange-600 bg-orange-50'
  if (type === 'ENUM') return 'text-pink-600 bg-pink-50'
  if (type === 'JSONB') return 'text-indigo-600 bg-indigo-50'
  return 'text-gray-600 bg-[rgb(255, 255, 255)]'
}

export function DatabaseSchema({
  showRelationships = true,
  expandedTables = [],
  onTableSelect = () => {}
}: DatabaseSchemaProps = {}) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [expandedTablesList, setExpandedTablesList] = useState<string[]>(expandedTables)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setExpandedTablesList(expandedTables)
  }, [expandedTables])

  const filteredTables = SCHEMA_TABLES.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleTableExpansion = (tableName: string) => {
    setExpandedTablesList(prev =>
      prev.includes(tableName)
        ? prev.filter(name => name !== tableName)
        : [...prev, tableName]
    )
  }

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName)
    onTableSelect(tableName)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[rgb(34,139,34)] rounded-xl">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[rgb(15,23,42)]">Database Schema</h1>
              <p className="text-gray-600 mt-1">Off-road trip planning application data structure</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              aria-label="Search database tables"
            />
          </div>
        </div>

        {/* Schema Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Table className="w-5 h-5 text-[rgb(34,139,34)]" />
              <h3 className="font-semibold text-[rgb(15,23,42)]">Total Tables</h3>
            </div>
            <p className="text-2xl font-bold text-[rgb(34,139,34)]">{SCHEMA_TABLES.length}</p>
          </div>

          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Link className="w-5 h-5 text-[rgb(245,158,11)]" />
              <h3 className="font-semibold text-[rgb(15,23,42)]">Relationships</h3>
            </div>
            <p className="text-2xl font-bold text-[rgb(245,158,11)]">
              {SCHEMA_TABLES.reduce((acc, table) => acc + table.relationships.length, 0)}
            </p>
          </div>

          <div className="bg-white border border-[rgb(226,232,240)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Key className="w-5 h-5 text-[rgb(220,38,38)]" />
              <h3 className="font-semibold text-[rgb(15,23,42)]">Primary Keys</h3>
            </div>
            <p className="text-2xl font-bold text-[rgb(220,38,38)]">{SCHEMA_TABLES.length}</p>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTables.map((table) => {
            const TableIcon = getTableIcon(table.name)
            const isExpanded = expandedTablesList.includes(table.name)
            const isSelected = selectedTable === table.name

            return (
              <div
                key={table.name}
                className={`bg-white border rounded-xl shadow-sm transition-all duration-200 ${
                  isSelected
                    ? 'border-[rgb(34,139,34)] ring-1 ring-[rgb(34,139,34)]/20'
                    : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]/50'
                }`}
              >
                {/* Table Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => {
                    toggleTableExpansion(table.name)
                    handleTableSelect(table.name)
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-label={`Toggle ${table.name} table details`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleTableExpansion(table.name)
                      handleTableSelect(table.name)
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[rgb(248,250,252)] rounded-lg">
                        <TableIcon className="w-5 h-5 text-[rgb(34,139,34)]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[rgb(15,23,42)] text-lg">{table.name}</h3>
                        <p className="text-sm text-gray-600">{table.description}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {table.columns.length} columns
                    </div>
                  </div>
                </div>

                {/* Table Details */}
                {isExpanded && (
                  <div className="border-t border-[rgb(226,232,240)] p-6 pt-4">
                    {/* Columns */}
                    <div className="mb-6">
                      <h4 className="font-medium text-[rgb(15,23,42)] mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Columns
                      </h4>
                      <div className="space-y-2">
                        {table.columns.map((column) => (
                          <div
                            key={column.name}
                            className="flex items-center justify-between p-3 bg-[rgb(248,250,252)] rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-[rgb(15,23,42)]">
                                {column.name}
                              </span>
                              {column.primaryKey && (
                                <Key className="w-4 h-4 text-[rgb(220,38,38)]" aria-label="Primary key" />
                              )}
                              {column.foreignKey && (
                                <Link className="w-4 h-4 text-[rgb(245,158,11)]" aria-label="Foreign key" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(column.type)}`}>
                                {column.type}
                              </span>
                              {!column.nullable && (
                                <span className="px-2 py-1 bg-red-50 text-[rgb(255, 255, 255)] rounded text-xs font-medium">
                                  NOT NULL
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Relationships */}
                    {showRelationships && table.relationships.length > 0 && (
                      <div>
                        <h4 className="font-medium text-[rgb(15,23,42)] mb-3 flex items-center gap-2">
                          <Link className="w-4 h-4" />
                          Relationships
                        </h4>
                        <div className="space-y-2">
                          {table.relationships.map((rel, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-[rgb(241,245,249)] rounded-lg"
                            >
                              <div>
                                <span className="font-medium text-[rgb(15,23,42)]">
                                  {rel.target}
                                </span>
                                <p className="text-sm text-gray-600">{rel.description}</p>
                              </div>
                              <span className="px-2 py-1 bg-blue-50 text-[rgb(34, 139, 34)] rounded text-xs font-medium">
                                {rel.type}
                              </span>
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
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[rgb(15, 23, 42)] mb-2">No tables found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DatabaseSchemaDemo() {
  return <DatabaseSchema />
}