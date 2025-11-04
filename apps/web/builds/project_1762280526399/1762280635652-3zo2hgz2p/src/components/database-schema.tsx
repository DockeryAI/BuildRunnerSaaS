'use client'

import { useState, useEffect } from 'react'
import { Database, Table, Key, Link, FileText, Download, Upload, Trash2, Plus, Search, Filter, Eye, EyeOff } from 'lucide-react'

interface DatabaseTable {
  id: string
  name: string
  description: string
  columns: DatabaseColumn[]
  relationships: Relationship[]
  records: number
  lastModified: string
}

interface DatabaseColumn {
  id: string
  name: string
  type: 'TEXT' | 'INTEGER' | 'BOOLEAN' | 'DATE' | 'JSON' | 'UUID'
  nullable: boolean
  primaryKey: boolean
  foreignKey?: string
  defaultValue?: string
}

interface Relationship {
  id: string
  fromTable: string
  toTable: string
  fromColumn: string
  toColumn: string
  type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY'
}

interface DatabaseSchemaProps {
  tables?: DatabaseTable[]
  onTableCreate?: (table: Omit<DatabaseTable, 'id' | 'lastModified'>) => void
  onTableUpdate?: (id: string, table: Partial<DatabaseTable>) => void
  onTableDelete?: (id: string) => void
  onExportSchema?: () => void
  onImportSchema?: (file: File) => void
  readOnly?: boolean
}

export function DatabaseSchema({
  tables = DEFAULT_TABLES,
  onTableCreate = () => console.log('Table created'),
  onTableUpdate = () => console.log('Table updated'),
  onTableDelete = () => console.log('Table deleted'),
  onExportSchema = () => console.log('Schema exported'),
  onImportSchema = () => console.log('Schema imported'),
  readOnly = false
}: DatabaseSchemaProps = {}) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showRelationships, setShowRelationships] = useState(true)
  const [isCreatingTable, setIsCreatingTable] = useState(false)
  const [newTable, setNewTable] = useState<Partial<DatabaseTable>>({
    name: '',
    description: '',
    columns: [],
    relationships: [],
    records: 0
  })

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeColor = (type: string) => {
    const colors = {
      TEXT: 'bg-blue-100 text-blue-800',
      INTEGER: 'bg-green-100 text-green-800',
      BOOLEAN: 'bg-purple-100 text-purple-800',
      DATE: 'bg-orange-100 text-orange-800',
      JSON: 'bg-yellow-100 text-yellow-800',
      UUID: 'bg-[rgb(241, 245, 249)] text-gray-800'
    }
    return colors[type as keyof typeof colors] || 'bg-[rgb(241, 245, 249)] text-gray-800'
  }

  const getRelationshipColor = (type: string) => {
    const colors = {
      ONE_TO_ONE: 'border-blue-400',
      ONE_TO_MANY: 'border-green-400',
      MANY_TO_MANY: 'border-purple-400'
    }
    return colors[type as keyof typeof colors] || 'border-gray-400'
  }

  const handleCreateTable = () => {
    if (newTable.name && newTable.description) {
      onTableCreate({
        name: newTable.name,
        description: newTable.description,
        columns: newTable.columns || [],
        relationships: newTable.relationships || [],
        records: 0
      })
      setNewTable({
        name: '',
        description: '',
        columns: [],
        relationships: [],
        records: 0
      })
      setIsCreatingTable(false)
    }
  }

  const addColumn = () => {
    const newColumn: DatabaseColumn = {
      id: `col_${Date.now()}`,
      name: '',
      type: 'TEXT',
      nullable: true,
      primaryKey: false
    }
    setNewTable(prev => ({
      ...prev,
      columns: [...(prev.columns || []), newColumn]
    }))
  }

  const updateColumn = (index: number, field: keyof DatabaseColumn, value: any) => {
    setNewTable(prev => ({
      ...prev,
      columns: prev.columns?.map((col, i) => 
        i === index ? { ...col, [field]: value } : col
      ) || []
    }))
  }

  const removeColumn = (index: number) => {
    setNewTable(prev => ({
      ...prev,
      columns: prev.columns?.filter((_, i) => i !== index) || []
    }))
  }

  return (
    <div className="min-h-screen bg-[#ffffff] font-medium">
      {/* Header */}
      <div className="border-b border-[#e2e8f0] bg-[#ffffff] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-[#228b22]" />
              <div>
                <h1 className="text-xl font-semibold text-[#0f172a]">Database Schema</h1>
                <p className="text-sm text-[#64748b]">{tables.length} tables configured</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRelationships(!showRelationships)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-[#e2e8f0] rounded-md hover:bg-[#f8fafc] transition-colors"
                aria-label={showRelationships ? 'Hide relationships' : 'Show relationships'}
              >
                {showRelationships ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Relationships
              </button>
              
              {!readOnly && (
                <>
                  <button
                    onClick={onExportSchema}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-[#e2e8f0] rounded-md hover:bg-[#f8fafc] transition-colors"
                    aria-label="Export schema"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  
                  <label className="flex items-center gap-2 px-3 py-2 text-sm border border-[#e2e8f0] rounded-md hover:bg-[#f8fafc] transition-colors cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && onImportSchema(e.target.files[0])}
                    />
                  </label>
                  
                  <button
                    onClick={() => setIsCreatingTable(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-md hover:bg-[#1e7b1e] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    New Table
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#e2e8f0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#228b22] focus:border-transparent"
            />
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className={`bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-6 shadow-md hover:shadow-lg transition-all cursor-pointer ${
                selectedTable === table.id ? 'ring-2 ring-[#228b22] border-[#228b22]' : ''
              }`}
              onClick={() => setSelectedTable(selectedTable === table.id ? null : table.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Table className="h-5 w-5 text-[#228b22]" />
                  <h3 className="font-semibold text-[#0f172a]">{table.name}</h3>
                </div>
                {!readOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTableDelete(table.id)
                    }}
                    className="text-[#ef4444] hover:bg-[#fef2f2] p-1 rounded"
                    aria-label={`Delete ${table.name} table`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <p className="text-sm text-[#64748b] mb-4">{table.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748b]">Columns:</span>
                  <span className="font-medium">{table.columns.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748b]">Records:</span>
                  <span className="font-medium">{table.records.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748b]">Modified:</span>
                  <span className="font-medium">{new Date(table.lastModified).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Column Preview */}
              <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                <div className="flex flex-wrap gap-1">
                  {table.columns.slice(0, 3).map((column) => (
                    <div key={column.id} className="flex items-center gap-1">
                      {column.primaryKey && <Key className="h-3 w-3 text-[#f59e0b]" />}
                      <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(column.type)}`}>
                        {column.name}
                      </span>
                    </div>
                  ))}
                  {table.columns.length > 3 && (
                    <span className="px-2 py-1 text-xs text-[#64748b]">
                      +{table.columns.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Table Details */}
        {selectedTable && (
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-lg p-6 shadow-md">
            {(() => {
              const table = tables.find(t => t.id === selectedTable)
              if (!table) return null

              return (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-[#0f172a]">{table.name} Schema</h2>
                    <button
                      onClick={() => setSelectedTable(null)}
                      className="text-[#64748b] hover:text-[#0f172a]"
                      aria-label="Close table details"
                    >
                      ×
                    </button>
                  </div>

                  {/* Columns */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-[#0f172a] mb-4">Columns</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#e2e8f0]">
                            <th className="text-left py-2 text-sm font-medium text-[#64748b]">Name</th>
                            <th className="text-left py-2 text-sm font-medium text-[#64748b]">Type</th>
                            <th className="text-left py-2 text-sm font-medium text-[#64748b]">Constraints</th>
                            <th className="text-left py-2 text-sm font-medium text-[#64748b]">Default</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.columns.map((column) => (
                            <tr key={column.id} className="border-b border-[#f1f5f9]">
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  {column.primaryKey && <Key className="h-4 w-4 text-[#f59e0b]" />}
                                  {column.foreignKey && <Link className="h-4 w-4 text-[#228b22]" />}
                                  <span className="font-medium">{column.name}</span>
                                </div>
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(column.type)}`}>
                                  {column.type}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="flex gap-1">
                                  {column.primaryKey && (
                                    <span className="px-2 py-1 text-xs bg-[#fef3c7] text-[#92400e] rounded">PK</span>
                                  )}
                                  {column.foreignKey && (
                                    <span className="px-2 py-1 text-xs bg-[#dcfce7] text-[#166534] rounded">FK</span>
                                  )}
                                  {!column.nullable && (
                                    <span className="px-2 py-1 text-xs bg-[#fee2e2] text-[#991b1b] rounded">NOT NULL</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 text-sm text-[#64748b]">
                                {column.defaultValue || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Relationships */}
                  {showRelationships && table.relationships.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-[#0f172a] mb-4">Relationships</h3>
                      <div className="space-y-3">
                        {table.relationships.map((rel) => (
                          <div
                            key={rel.id}
                            className={`p-4 border-l-4 ${getRelationshipColor(rel.type)} bg-[#f8fafc] rounded-r-md`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{rel.fromTable}.{rel.fromColumn}</span>
                                <span className="mx-2 text-[#64748b]">→</span>
                                <span className="font-medium">{rel.toTable}.{rel.toColumn}</span>
                              </div>
                              <span className="px-2 py-1 text-xs bg-[#ffffff] border border-[#e2e8f0] rounded">
                                {rel.type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* Create Table Modal */}
        {isCreatingTable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#ffffff] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#0f172a]">Create New Table</h2>
                <button
                  onClick={() => setIsCreatingTable(false)}
                  className="text-[#64748b] hover:text-[#0f172a]"
                  aria-label="Close create table modal"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-1">Table Name</label>
                  <input
                    type="text"
                    value={newTable.name || ''}
                    onChange={(e) => setNewTable(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#228b22]"
                    placeholder="e.g., users, trips, locations"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-1">Description</label>
                  <textarea
                    value={newTable.description || ''}
                    onChange={(e) => setNewTable(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#228b22]"
                    rows={3}
                    placeholder="Describe what this table stores..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-[#0f172a]">Columns</label>
                    <button
                      onClick={addColumn}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-[#228b22] text-[#ffffff] rounded-md hover:bg-[#1e7b1e]"
                    >
                      <Plus className="h-3 w-3" />
                      Add Column
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newTable.columns?.map((column, index) => (
                      <div key={index} className="flex gap-2 items-start p-3 border border-[#e2e8f0] rounded-md">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            placeholder="Column name"
                            value={column.name}
                            onChange={(e) => updateColumn(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-[#e2e8f0] rounded"
                          />
                          <select
                            value={column.type}
                            onChange={(e) => updateColumn(index, 'type', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-[#e2e8f0] rounded"
                          >
                            <option value="TEXT">TEXT</option>
                            <option value="INTEGER">INTEGER</option>
                            <option value="BOOLEAN">BOOLEAN</option>
                            <option value="DATE">DATE</option>
                            <option value="JSON">JSON</option>
                            <option value="UUID">UUID</option>
                          </select>
                          <div className="flex gap-2 text-sm">
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={column.primaryKey}
                                onChange={(e) => updateColumn(index, 'primaryKey', e.target.checked)}
                                className="rounded"
                              />
                              Primary Key
                            </label>
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={column.nullable}
                                onChange={(e) => updateColumn(index, 'nullable', e.target.checked)}
                                className="rounded"
                              />
                              Nullable
                            </label>
                          </div>
                        </div>
                        <button
                          onClick={() => removeColumn(index)}
                          className="text-[#ef4444] hover:bg-[#fef2f2] p-1 rounded"
                          aria-label="Remove column"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsCreatingTable(false)}
                    className="px-4 py-2 border border-[#e2e8f0] rounded-md hover:bg-[#f8fafc] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTable}
                    disabled={!newTable.name || !newTable.description}
                    className="px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-md hover:bg-[#1e7b1e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTables.length === 0 && (
          <div className="text-center py-12">
            <Database className="h-12 w-12 text-[#64748b] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#0f172a] mb-2">
              {searchTerm ? 'No tables found' : 'No tables configured'}
            </h3>
            <p className="text-[#64748b] mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Create your first table to get started with your database schema'
              }
            </p>
            {!readOnly && !searchTerm && (
              <button
                onClick={() => setIsCreatingTable(true)}
                className="px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-md hover:bg-[#1e7b1e] transition-colors"
              >
                Create First Table
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data for demo
const DEFAULT_TABLES: DatabaseTable[] = [
  {
    id: '1',
    name: 'users',
    description: 'User accounts and profile information',
    records: 1247,
    lastModified: '2024-01-15T10:30:00Z',
    columns: [
      {
        id: 'col1',
        name: 'id',
        type: 'UUID',
        nullable: false,
        primaryKey: true
      },
      {
        id: 'col2',
        name: 'email',
        type: 'TEXT',
        nullable: false,
        primaryKey: false
      },
      {
        id: 'col3',
        name: 'name',
        type: 'TEXT',
        nullable: false,
        primaryKey: false
      },
      {
        id: 'col4',
        name: 'created_at',
        type: 'DATE',
        nullable: false,
        primaryKey: false,
        defaultValue: 'NOW()'
      }
    ],
    relationships: [
      {
        id: 'rel1',
        fromTable: 'users',
        toTable: 'trips',
        fromColumn: 'id',
        toColumn: 'organizer_id',
        type: 'ONE_TO_MANY'
      }
    ]
  },
  {
    id: '2',
    name: 'trips',
    description: 'Off-road trip planning and details',
    records: 89,
    lastModified: '2024-01-14T15:45:00Z',
    columns: [
      {
        id: 'col5',
        name: 'id',
        type: 'UUID',
        nullable: false,
        primaryKey: true
      },
      {
        id: 'col6',
        name: 'title',
        type: 'TEXT',
        nullable: false,
        primaryKey: false
      },
      {
        id: 'col7',
        name: 'location',
        type: 'JSON',
        nullable: false,
        primaryKey: false
      },
      {
        id: 'col8',
        name: 'organizer_id',
        type: 'UUID',
        nullable: false,
        primaryKey: false,
        foreignKey: 'users.id'
      },
      {
        id: 'col9',
        name: 'start_date',
        type: 'DATE',
        nullable: false,
        primaryKey: false
      },
      {
        id: 'col10',
        name: 'end_date',
        type: 'DATE',
        nullable: false,
        primaryKey: false
      }
    ],
    relationships: [
      {
        id: 'rel2',
        fromTable: 'trips',
        toTable: 'trip_participants',
        fromColumn: 'id',
        toColumn: 'trip_id',
        type: 'ONE_TO_MANY'
      }
    ]
  },
  {
    id: '3',
    name: 'trip_participants',
    description: 'Users participating in specific trips',
    records: 456,
    lastModified: '2024-01-13T09:20:00Z',
    columns: [
      {
        id: 'col11',
        name: 'id',
        type: 'UUID',
        nullable: false,
        primaryKey: true
      },
      {
        id: 'col12',
        name: 'trip_id',
        type: 'UUID',
        nullable: false,
        primaryKey: false,
        foreignKey: 'trips.id'
      },
      {
        id: 'col13',
        name: 'user_id',
        type: 'UUID',
        nullable: false,
        primaryKey: false,
        foreignKey: 'users.id'
      },
      {
        id: 'col14',
        name: 'rsvp_status',
        type: 'TEXT',
        nullable: false,
        primaryKey: false,
        defaultValue: 'pending'
      },
      {
        id: 'col15',
        name: 'joined_at',
        type: 'DATE',
        nullable: false,
        primaryKey: false,
        defaultValue: 'NOW()'
      }
    ],
    relationships: []
  },
  {
    id: '4',
    name: 'tasks',
    description: 'Trip tasks and assignments',
    records: 234,
    lastModified: '2024-01-12T14:10:00Z',
    columns: [
      {
        id: 'col16',
        name: 'id',
        type: 'UUID',
        nullable: false,
        primaryKey: true
      },
      {
        id: 'col17',
        name: 'trip_id',
        type: 'UUID',
        nullable: false,
        primaryKey: false,
        foreignKey: 'trips.id'
      },
      {
        id: 'col18',
        name: 'title',
        type: 'TEXT',
        nullable: false,
        primaryKey: false
      },
      {
        id: 'col19',
        name: 'assigned_to',
        type: 'UUID',
        nullable: true,
        primaryKey: false,
        foreignKey: 'users.id'
      },
      {
        id: 'col20',
        name: 'completed',
        type: 'BOOLEAN',
        nullable: false,
        primaryKey: false,
        defaultValue: 'false'
      }
    ],
    relationships: []
  }
]

// Demo component for page.tsx
export default function DatabaseSchemaDemo() {
  return <DatabaseSchema />
}