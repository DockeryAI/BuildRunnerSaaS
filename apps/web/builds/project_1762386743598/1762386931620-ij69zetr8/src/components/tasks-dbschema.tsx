'use client'

import { useState } from 'react'
import { Database, Table, Key, Link, Plus, Trash2, Edit3 } from 'lucide-react'

interface TaskField {
  id: string
  name: string
  type: 'text' | 'integer' | 'boolean' | 'timestamp' | 'uuid' | 'foreign_key'
  nullable: boolean
  primaryKey: boolean
  foreignKey?: {
    table: string
    column: string
  }
  defaultValue?: string
}

interface DatabaseTable {
  id: string
  name: string
  description: string
  fields: TaskField[]
}

interface TasksDBSchemaProps {
  tables?: DatabaseTable[]
  onTableUpdate?: (table: DatabaseTable) => void
  onFieldUpdate?: (tableId: string, field: TaskField) => void
}

const DEFAULT_TABLES: DatabaseTable[] = [
  {
    id: '1',
    name: 'tasks',
    description: 'Core task management table for trip planning',
    fields: [
      {
        id: '1',
        name: 'id',
        type: 'uuid',
        nullable: false,
        primaryKey: true,
        defaultValue: 'gen_random_uuid()'
      },
      {
        id: '2',
        name: 'trip_id',
        type: 'foreign_key',
        nullable: false,
        primaryKey: false,
        foreignKey: {
          table: 'trips',
          column: 'id'
        }
      },
      {
        id: '3',
        name: 'title',
        type: 'text',
        nullable: false,
        primaryKey: false
      },
      {
        id: '4',
        name: 'description',
        type: 'text',
        nullable: true,
        primaryKey: false
      },
      {
        id: '5',
        name: 'assigned_to',
        type: 'foreign_key',
        nullable: true,
        primaryKey: false,
        foreignKey: {
          table: 'trip_members',
          column: 'id'
        }
      },
      {
        id: '6',
        name: 'category',
        type: 'text',
        nullable: false,
        primaryKey: false,
        defaultValue: 'general'
      },
      {
        id: '7',
        name: 'priority',
        type: 'text',
        nullable: false,
        primaryKey: false,
        defaultValue: 'medium'
      },
      {
        id: '8',
        name: 'due_date',
        type: 'timestamp',
        nullable: true,
        primaryKey: false
      },
      {
        id: '9',
        name: 'completed',
        type: 'boolean',
        nullable: false,
        primaryKey: false,
        defaultValue: 'false'
      },
      {
        id: '10',
        name: 'completed_at',
        type: 'timestamp',
        nullable: true,
        primaryKey: false
      },
      {
        id: '11',
        name: 'created_at',
        type: 'timestamp',
        nullable: false,
        primaryKey: false,
        defaultValue: 'now()'
      },
      {
        id: '12',
        name: 'updated_at',
        type: 'timestamp',
        nullable: false,
        primaryKey: false,
        defaultValue: 'now()'
      }
    ]
  },
  {
    id: '2',
    name: 'task_categories',
    description: 'Predefined categories for organizing tasks',
    fields: [
      {
        id: '1',
        name: 'id',
        type: 'uuid',
        nullable: false,
        primaryKey: true,
        defaultValue: 'gen_random_uuid()'
      },
      {
        id: '2',
        name: 'name',
        type: 'text',
        nullable: false,
        primaryKey: false
      },
      {
        id: '3',
        name: 'color',
        type: 'text',
        nullable: false,
        primaryKey: false,
        defaultValue: '#10b981'
      },
      {
        id: '4',
        name: 'icon',
        type: 'text',
        nullable: true,
        primaryKey: false
      },
      {
        id: '5',
        name: 'created_at',
        type: 'timestamp',
        nullable: false,
        primaryKey: false,
        defaultValue: 'now()'
      }
    ]
  },
  {
    id: '3',
    name: 'task_comments',
    description: 'Comments and updates on tasks',
    fields: [
      {
        id: '1',
        name: 'id',
        type: 'uuid',
        nullable: false,
        primaryKey: true,
        defaultValue: 'gen_random_uuid()'
      },
      {
        id: '2',
        name: 'task_id',
        type: 'foreign_key',
        nullable: false,
        primaryKey: false,
        foreignKey: {
          table: 'tasks',
          column: 'id'
        }
      },
      {
        id: '3',
        name: 'user_id',
        type: 'foreign_key',
        nullable: false,
        primaryKey: false,
        foreignKey: {
          table: 'trip_members',
          column: 'id'
        }
      },
      {
        id: '4',
        name: 'content',
        type: 'text',
        nullable: false,
        primaryKey: false
      },
      {
        id: '5',
        name: 'created_at',
        type: 'timestamp',
        nullable: false,
        primaryKey: false,
        defaultValue: 'now()'
      }
    ]
  }
]

export function TasksDBSchema({
  tables = DEFAULT_TABLES,
  onTableUpdate = () => console.log('Table updated'),
  onFieldUpdate = () => console.log('Field updated')
}: TasksDBSchemaProps = {}) {
  const [selectedTable, setSelectedTable] = useState<string>(tables[0]?.id || '')
  const [editingField, setEditingField] = useState<string | null>(null)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'uuid':
        return 'bg-secondary/10 text-secondary border-secondary/20 dark:bg-secondary/20 dark:text-secondary dark:border-secondary/30'
      case 'text':
        return 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30'
      case 'integer':
        return 'bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-accent dark:border-accent/30'
      case 'boolean':
        return 'bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-accent dark:border-accent/30'
      case 'timestamp':
        return 'bg-secondary/10 text-secondary border-secondary/20 dark:bg-secondary/20 dark:text-secondary dark:border-secondary/30'
      case 'foreign_key':
        return 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30'
      default:
        return 'bg-muted text-mutedForeground border-border dark:bg-muted dark:text-mutedForeground dark:border-border'
    }
  }

  const selectedTableData = tables.find(table => table.id === selectedTable)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface dark:from-background dark:to-surface font-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <Database className="w-6 h-6 text-primaryForeground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground dark:text-foreground">Tasks Database Schema</h1>
              <p className="text-mutedForeground dark:text-mutedForeground mt-1 font-sans">Database structure for off-road trip task management</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table List */}
          <div className="lg:col-span-1">
            <div className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground dark:text-foreground">Tables</h2>
                <button 
                  className="p-2 text-mutedForeground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background"
                  aria-label="Add new table"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background ${
                      selectedTable === table.id
                        ? 'bg-primary/10 border border-primary/20 text-primary dark:bg-primary/20 dark:border-primary/30 dark:text-primary shadow-sm'
                        : 'hover:bg-muted dark:hover:bg-muted border border-transparent text-foreground dark:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4" />
                      <span className="font-medium">{table.name}</span>
                    </div>
                    <p className="text-xs text-mutedForeground dark:text-mutedForeground mt-1 line-clamp-2">
                      {table.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Details */}
          <div className="lg:col-span-3">
            {selectedTableData ? (
              <div className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border shadow-sm hover:shadow-md transition-all duration-300">
                {/* Table Header */}
                <div className="p-6 border-b border-border dark:border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground dark:text-foreground flex items-center gap-2">
                        <Table className="w-5 h-5 text-primary dark:text-primary" />
                        {selectedTableData.name}
                      </h3>
                      <p className="text-mutedForeground dark:text-mutedForeground mt-1">{selectedTableData.description}</p>
                    </div>
                    <button 
                      className="p-2 text-mutedForeground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background"
                      aria-label="Edit table"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Fields */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-foreground dark:text-foreground">Fields</h4>
                    <button 
                      className="px-4 py-2 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-all duration-150 font-medium text-sm shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background"
                      aria-label="Add new field"
                    >
                      <Plus className="w-4 h-4" />
                      Add Field
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border dark:border-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground dark:text-foreground">Field Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground dark:text-foreground">Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground dark:text-foreground">Constraints</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground dark:text-foreground">Default</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground dark:text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTableData.fields.map((field) => (
                          <tr key={field.id} className="border-b border-border/50 dark:border-border/50 hover:bg-muted/50 dark:hover:bg-muted/50 transition-all duration-150">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {field.primaryKey && (
                                  <Key className="w-4 h-4 text-accent dark:text-accent" />
                                )}
                                {field.foreignKey && (
                                  <Link className="w-4 h-4 text-destructive dark:text-destructive" />
                                )}
                                <span className="font-medium text-foreground dark:text-foreground">{field.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(field.type)}`}>
                                {field.type}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1 flex-wrap">
                                {field.primaryKey && (
                                  <span className="px-2 py-1 bg-accent/10 text-accent border border-accent/20 dark:bg-accent/20 dark:text-accent dark:border-accent/30 rounded-full text-xs font-medium">
                                    PK
                                  </span>
                                )}
                                {!field.nullable && (
                                  <span className="px-2 py-1 bg-destructive/10 text-destructive border border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30 rounded-full text-xs font-medium">
                                    NOT NULL
                                  </span>
                                )}
                                {field.foreignKey && (
                                  <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30 rounded-full text-xs font-medium">
                                    FK → {field.foreignKey.table}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-mutedForeground dark:text-mutedForeground font-mono">
                                {field.defaultValue || '—'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingField(field.id)}
                                  className="p-1 text-mutedForeground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background"
                                  aria-label={`Edit field ${field.name}`}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  className="p-1 text-mutedForeground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background"
                                  aria-label={`Delete field ${field.name}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SQL Preview */}
                <div className="p-6 border-t border-border dark:border-border bg-muted/30 dark:bg-muted/30 rounded-b-xl">
                  <h4 className="text-lg font-semibold text-foreground dark:text-foreground mb-3">SQL Schema</h4>
                  <div className="bg-background dark:bg-surface rounded-lg p-4 overflow-x-auto border border-border dark:border-border">
                    <pre className="text-sm text-foreground dark:text-foreground font-mono">
{`CREATE TABLE ${selectedTableData.name} (
${selectedTableData.fields.map(field => {
  let line = `  ${field.name} ${field.type.toUpperCase()}`
  if (!field.nullable) line += ' NOT NULL'
  if (field.primaryKey) line += ' PRIMARY KEY'
  if (field.defaultValue) line += ` DEFAULT ${field.defaultValue}`
  return line
}).join(',\n')}
);`}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-12 text-center">
                <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Database className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                </div>
                <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No table selected</h3>
                <p className="text-mutedForeground dark:text-mutedForeground text-sm">Select a table from the list to view its schema</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TasksDBSchemaDemo() {
  return <TasksDBSchema />
}