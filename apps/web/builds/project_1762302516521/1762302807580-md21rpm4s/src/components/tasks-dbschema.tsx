'use client'

import { useState, useEffect } from 'react'
import { Database, Table, Plus, Edit3, Trash2, Save, X, Users, Calendar, MapPin } from 'lucide-react'

// Database Schema Types
interface TaskSchema {
  id: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'enum'
  required: boolean
  defaultValue?: any
  enumValues?: string[]
  description?: string
}

interface TableSchema {
  id: string
  name: string
  description: string
  fields: TaskSchema[]
  relationships: RelationshipSchema[]
  createdAt: string
  updatedAt: string
}

interface RelationshipSchema {
  id: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  targetTable: string
  foreignKey: string
  description: string
}

interface TasksDBSchemaProps {
  onSchemaUpdate?: (schema: TableSchema[]) => void
  readOnly?: boolean
  initialSchema?: TableSchema[]
}

const DEFAULT_TASK_TABLES: TableSchema[] = [
  {
    id: 'tasks',
    name: 'tasks',
    description: 'Main tasks table for trip planning and group coordination',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        id: 'id',
        name: 'id',
        type: 'text',
        required: true,
        description: 'Unique task identifier'
      },
      {
        id: 'title',
        name: 'title',
        type: 'text',
        required: true,
        description: 'Task title or name'
      },
      {
        id: 'description',
        name: 'description',
        type: 'text',
        required: false,
        description: 'Detailed task description'
      },
      {
        id: 'category',
        name: 'category',
        type: 'enum',
        required: true,
        enumValues: ['food', 'equipment', 'transportation', 'accommodation', 'safety', 'entertainment'],
        description: 'Task category for organization'
      },
      {
        id: 'priority',
        name: 'priority',
        type: 'enum',
        required: true,
        enumValues: ['low', 'medium', 'high', 'critical'],
        defaultValue: 'medium',
        description: 'Task priority level'
      },
      {
        id: 'status',
        name: 'status',
        type: 'enum',
        required: true,
        enumValues: ['pending', 'in_progress', 'completed', 'cancelled'],
        defaultValue: 'pending',
        description: 'Current task status'
      },
      {
        id: 'assigned_to',
        name: 'assigned_to',
        type: 'text',
        required: false,
        description: 'User ID of assigned group member'
      },
      {
        id: 'trip_id',
        name: 'trip_id',
        type: 'text',
        required: true,
        description: 'Associated trip identifier'
      },
      {
        id: 'due_date',
        name: 'due_date',
        type: 'date',
        required: false,
        description: 'Task deadline'
      },
      {
        id: 'estimated_cost',
        name: 'estimated_cost',
        type: 'number',
        required: false,
        description: 'Estimated cost in dollars'
      },
      {
        id: 'actual_cost',
        name: 'actual_cost',
        type: 'number',
        required: false,
        description: 'Actual cost spent'
      },
      {
        id: 'notes',
        name: 'notes',
        type: 'text',
        required: false,
        description: 'Additional task notes'
      },
      {
        id: 'created_at',
        name: 'created_at',
        type: 'date',
        required: true,
        description: 'Task creation timestamp'
      },
      {
        id: 'updated_at',
        name: 'updated_at',
        type: 'date',
        required: true,
        description: 'Last update timestamp'
      }
    ],
    relationships: [
      {
        id: 'task_trip',
        type: 'many-to-one',
        targetTable: 'trips',
        foreignKey: 'trip_id',
        description: 'Tasks belong to a specific trip'
      },
      {
        id: 'task_assignee',
        type: 'many-to-one',
        targetTable: 'group_members',
        foreignKey: 'assigned_to',
        description: 'Tasks can be assigned to group members'
      }
    ]
  },
  {
    id: 'task_comments',
    name: 'task_comments',
    description: 'Comments and updates on tasks',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        id: 'id',
        name: 'id',
        type: 'text',
        required: true,
        description: 'Unique comment identifier'
      },
      {
        id: 'task_id',
        name: 'task_id',
        type: 'text',
        required: true,
        description: 'Associated task ID'
      },
      {
        id: 'user_id',
        name: 'user_id',
        type: 'text',
        required: true,
        description: 'Comment author ID'
      },
      {
        id: 'content',
        name: 'content',
        type: 'text',
        required: true,
        description: 'Comment content'
      },
      {
        id: 'created_at',
        name: 'created_at',
        type: 'date',
        required: true,
        description: 'Comment creation timestamp'
      }
    ],
    relationships: [
      {
        id: 'comment_task',
        type: 'many-to-one',
        targetTable: 'tasks',
        foreignKey: 'task_id',
        description: 'Comments belong to a task'
      },
      {
        id: 'comment_author',
        type: 'many-to-one',
        targetTable: 'group_members',
        foreignKey: 'user_id',
        description: 'Comments have an author'
      }
    ]
  }
]

export function TasksDBSchema({
  onSchemaUpdate = () => {},
  readOnly = false,
  initialSchema = DEFAULT_TASK_TABLES
}: TasksDBSchemaProps = {}) {
  const [schema, setSchema] = useState<TableSchema[]>(initialSchema)
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [editingField, setEditingField] = useState<string>('')
  const [newField, setNewField] = useState<Partial<TaskSchema>>({})
  const [showAddField, setShowAddField] = useState(false)

  useEffect(() => {
    onSchemaUpdate(schema)
  }, [schema, onSchemaUpdate])

  const addField = (tableId: string) => {
    if (!newField.name || !newField.type) return

    setSchema(prev => prev.map(table => 
      table.id === tableId 
        ? {
            ...table,
            fields: [...table.fields, {
              id: `${newField.name}_${Date.now()}`,
              name: newField.name,
              type: newField.type as any,
              required: newField.required || false,
              description: newField.description || '',
              ...(newField.enumValues && { enumValues: newField.enumValues })
            }],
            updatedAt: new Date().toISOString()
          }
        : table
    ))

    setNewField({})
    setShowAddField(false)
  }

  const updateField = (tableId: string, fieldId: string, updates: Partial<TaskSchema>) => {
    setSchema(prev => prev.map(table => 
      table.id === tableId 
        ? {
            ...table,
            fields: table.fields.map(field => 
              field.id === fieldId ? { ...field, ...updates } : field
            ),
            updatedAt: new Date().toISOString()
          }
        : table
    ))
  }

  const removeField = (tableId: string, fieldId: string) => {
    setSchema(prev => prev.map(table => 
      table.id === tableId 
        ? {
            ...table,
            fields: table.fields.filter(field => field.id !== fieldId),
            updatedAt: new Date().toISOString()
          }
        : table
    ))
  }

  const getTypeColor = (type: string) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800 border-blue-200',
      number: 'bg-green-100 text-green-800 border-green-200',
      boolean: 'bg-purple-100 text-purple-800 border-purple-200',
      date: 'bg-orange-100 text-orange-800 border-orange-200',
      enum: 'bg-pink-100 text-pink-800 border-pink-200'
    }
    return colors[type as keyof typeof colors] || 'bg-[rgb(248, 250, 252)] text-gray-800 border-[rgb(226, 232, 240)]'
  }

  return (
    <div className="min-h-screen bg-[#ffffff] font-medium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#228b22] rounded-lg">
              <Database className="w-6 h-6 text-[#ffffff]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0f172a]">Tasks Database Schema</h1>
          </div>
          <p className="text-[#64748b]">
            Define and manage the database structure for task management and group coordination
          </p>
        </div>

        {/* Schema Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Table className="w-5 h-5 text-[#228b22]" />
              <span className="font-semibold text-[#0f172a]">Tables</span>
            </div>
            <div className="text-2xl font-bold text-[#0f172a]">{schema.length}</div>
          </div>

          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-[#f97316]" />
              <span className="font-semibold text-[#0f172a]">Total Fields</span>
            </div>
            <div className="text-2xl font-bold text-[#0f172a]">
              {schema.reduce((acc, table) => acc + table.fields.length, 0)}
            </div>
          </div>

          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-[#dc2626]" />
              <span className="font-semibold text-[#0f172a]">Relationships</span>
            </div>
            <div className="text-2xl font-bold text-[#0f172a]">
              {schema.reduce((acc, table) => acc + table.relationships.length, 0)}
            </div>
          </div>
        </div>

        {/* Tables List */}
        <div className="space-y-6">
          {schema.map((table) => (
            <div key={table.id} className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl shadow-md">
              {/* Table Header */}
              <div className="p-6 border-b border-[#e2e8f0]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[#0f172a]">{table.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#228b22]/10 text-[#228b22] rounded-full text-sm border border-[#228b22]/20">
                      {table.fields.length} fields
                    </span>
                    {!readOnly && (
                      <button
                        onClick={() => setSelectedTable(selectedTable === table.id ? '' : table.id)}
                        className="p-2 text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                        aria-label={`${selectedTable === table.id ? 'Collapse' : 'Expand'} ${table.name} table`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[#64748b]">{table.description}</p>
              </div>

              {/* Table Fields */}
              {selectedTable === table.id && (
                <div className="p-6">
                  <div className="space-y-4">
                    {table.fields.map((field) => (
                      <div key={field.id} className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-[#0f172a]">{field.name}</span>
                            <span className={`px-2 py-1 rounded text-xs border ${getTypeColor(field.type)}`}>
                              {field.type}
                            </span>
                            {field.required && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs border border-red-200">
                                required
                              </span>
                            )}
                          </div>
                          {field.description && (
                            <p className="text-sm text-[#64748b]">{field.description}</p>
                          )}
                          {field.enumValues && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {field.enumValues.map((value) => (
                                <span key={value} className="px-2 py-1 bg-[#228b22]/10 text-[#228b22] rounded text-xs border border-[#228b22]/20">
                                  {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {!readOnly && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingField(editingField === field.id ? '' : field.id)}
                              className="p-2 text-[#64748b] hover:text-[#228b22] hover:bg-[#228b22]/10 rounded-lg transition-colors"
                              aria-label={`Edit ${field.name} field`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeField(table.id, field.id)}
                              className="p-2 text-[#64748b] hover:text-[#dc2626] hover:bg-red-50 rounded-lg transition-colors"
                              aria-label={`Delete ${field.name} field`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add New Field */}
                    {!readOnly && (
                      <div className="mt-6">
                        {!showAddField ? (
                          <button
                            onClick={() => setShowAddField(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-lg hover:bg-[#1e7a1e] transition-colors font-medium shadow-md hover:shadow-lg active:scale-95"
                          >
                            <Plus className="w-4 h-4" />
                            Add Field
                          </button>
                        ) : (
                          <div className="p-4 bg-[#ffffff] border border-[#e2e8f0] rounded-lg space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="Field name"
                                value={newField.name || ''}
                                onChange={(e) => setNewField(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-[#64748b] focus:border-[#228b22] focus:outline-none focus:ring-1 focus:ring-[#228b22]/50 transition-all duration-150"
                              />
                              <select
                                value={newField.type || ''}
                                onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value as any }))}
                                className="w-full px-4 py-2.5 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:border-[#228b22] focus:outline-none focus:ring-1 focus:ring-[#228b22]/50 transition-all duration-150"
                              >
                                <option value="">Select type</option>
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="date">Date</option>
                                <option value="enum">Enum</option>
                              </select>
                            </div>
                            <input
                              type="text"
                              placeholder="Description"
                              value={newField.description || ''}
                              onChange={(e) => setNewField(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-4 py-2.5 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-[#64748b] focus:border-[#228b22] focus:outline-none focus:ring-1 focus:ring-[#228b22]/50 transition-all duration-150"
                            />
                            {newField.type === 'enum' && (
                              <input
                                type="text"
                                placeholder="Enum values (comma separated)"
                                onChange={(e) => setNewField(prev => ({ 
                                  ...prev, 
                                  enumValues: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                                }))}
                                className="w-full px-4 py-2.5 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-[#64748b] focus:border-[#228b22] focus:outline-none focus:ring-1 focus:ring-[#228b22]/50 transition-all duration-150"
                              />
                            )}
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="required"
                                checked={newField.required || false}
                                onChange={(e) => setNewField(prev => ({ ...prev, required: e.target.checked }))}
                                className="w-4 h-4 text-[#228b22] border-[#e2e8f0] rounded focus:ring-[#228b22] focus:ring-2"
                              />
                              <label htmlFor="required" className="text-sm text-[#0f172a]">Required field</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => addField(table.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-lg hover:bg-[#1e7a1e] transition-colors font-medium shadow-md hover:shadow-lg active:scale-95"
                              >
                                <Save className="w-4 h-4" />
                                Save Field
                              </button>
                              <button
                                onClick={() => {
                                  setShowAddField(false)
                                  setNewField({})
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-[#f1f5f9] text-[#0f172a] rounded-lg hover:bg-[#e2e8f0] transition-colors font-medium border border-[#e2e8f0]"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Relationships */}
                  {table.relationships.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-[#e2e8f0]">
                      <h4 className="text-lg font-semibold text-[#0f172a] mb-4">Relationships</h4>
                      <div className="space-y-3">
                        {table.relationships.map((rel) => (
                          <div key={rel.id} className="flex items-center gap-4 p-3 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0]">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-[#0f172a]">{rel.type}</span>
                                <span className="text-[#64748b]">→</span>
                                <span className="font-medium text-[#228b22]">{rel.targetTable}</span>
                              </div>
                              <p className="text-sm text-[#64748b]">{rel.description}</p>
                            </div>
                            <span className="px-2 py-1 bg-[#f97316]/10 text-[#f97316] rounded text-xs border border-[#f97316]/20">
                              {rel.foreignKey}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Schema Export */}
        <div className="mt-8 p-6 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl">
          <h3 className="text-lg font-semibold text-[#0f172a] mb-4">Schema Export</h3>
          <div className="bg-[#0f172a] rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-[#e2e8f0] font-mono">
              {JSON.stringify(schema, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

// Demo component for page.tsx
export default function TasksDBSchemaDemo() {
  const handleSchemaUpdate = (schema: TableSchema[]) => {
    console.log('Schema updated:', schema)
  }

  return (
    <TasksDBSchema 
      onSchemaUpdate={handleSchemaUpdate}
      readOnly={false}
    />
  )
}