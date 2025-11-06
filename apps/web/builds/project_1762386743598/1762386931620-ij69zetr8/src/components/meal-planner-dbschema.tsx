'use client'

import { useState } from 'react'
import { Database, Table, Key, Calendar, Users, MapPin, MessageSquare, Utensils, CheckSquare } from 'lucide-react'

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
  type: 'one-to-many' | 'many-to-many' | 'one-to-one'
  fromTable: string
  toTable: string
  description: string
}

interface MealPlannerDBSchemaProps {
  onSchemaUpdate?: (schema: TableSchema[]) => void
  readOnly?: boolean
}

export function MealPlannerDBSchema({
  onSchemaUpdate = () => console.log('Schema updated'),
  readOnly = false
}: MealPlannerDBSchemaProps = {}) {
  const [selectedTable, setSelectedTable] = useState<string>('trips')
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual')

  const mealPlannerSchema: TableSchema[] = [
    {
      id: 'trips',
      name: 'trips',
      description: 'Core trip information and planning data',
      columns: [
        { id: 'trip_id', name: 'trip_id', type: 'UUID', nullable: false, primaryKey: true },
        { id: 'title', name: 'title', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
        { id: 'description', name: 'description', type: 'TEXT', nullable: true, primaryKey: false },
        { id: 'location', name: 'location', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
        { id: 'start_date', name: 'start_date', type: 'TIMESTAMP', nullable: false, primaryKey: false },
        { id: 'end_date', name: 'end_date', type: 'TIMESTAMP', nullable: false, primaryKey: false },
        { id: 'organizer_id', name: 'organizer_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'users.user_id' },
        { id: 'status', name: 'status', type: 'ENUM', nullable: false, primaryKey: false },
        { id: 'created_at', name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false },
        { id: 'updated_at', name: 'updated_at', type: 'TIMESTAMP', nullable: false, primaryKey: false }
      ],
      relationships: [
        { id: 'trip_organizer', type: 'many-to-one', fromTable: 'trips', toTable: 'users', description: 'Trip organizer relationship' },
        { id: 'trip_meals', type: 'one-to-many', fromTable: 'trips', toTable: 'meals', description: 'Trip can have multiple meals' }
      ]
    },
    {
      id: 'meals',
      name: 'meals',
      description: 'Meal planning and scheduling for trips',
      columns: [
        { id: 'meal_id', name: 'meal_id', type: 'UUID', nullable: false, primaryKey: true },
        { id: 'trip_id', name: 'trip_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'trips.trip_id' },
        { id: 'meal_name', name: 'meal_name', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
        { id: 'meal_type', name: 'meal_type', type: 'ENUM', nullable: false, primaryKey: false },
        { id: 'scheduled_date', name: 'scheduled_date', type: 'DATE', nullable: false, primaryKey: false },
        { id: 'scheduled_time', name: 'scheduled_time', type: 'TIME', nullable: true, primaryKey: false },
        { id: 'description', name: 'description', type: 'TEXT', nullable: true, primaryKey: false },
        { id: 'dietary_restrictions', name: 'dietary_restrictions', type: 'JSON', nullable: true, primaryKey: false },
        { id: 'estimated_cost', name: 'estimated_cost', type: 'DECIMAL(10,2)', nullable: true, primaryKey: false },
        { id: 'assigned_to', name: 'assigned_to', type: 'UUID', nullable: true, primaryKey: false, foreignKey: 'users.user_id' },
        { id: 'status', name: 'status', type: 'ENUM', nullable: false, primaryKey: false },
        { id: 'created_at', name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false }
      ],
      relationships: [
        { id: 'meal_trip', type: 'many-to-one', fromTable: 'meals', toTable: 'trips', description: 'Meal belongs to trip' },
        { id: 'meal_assignee', type: 'many-to-one', fromTable: 'meals', toTable: 'users', description: 'Meal assigned to user' },
        { id: 'meal_ingredients', type: 'one-to-many', fromTable: 'meals', toTable: 'meal_ingredients', description: 'Meal has ingredients' }
      ]
    },
    {
      id: 'meal_ingredients',
      name: 'meal_ingredients',
      description: 'Ingredients and shopping list for meals',
      columns: [
        { id: 'ingredient_id', name: 'ingredient_id', type: 'UUID', nullable: false, primaryKey: true },
        { id: 'meal_id', name: 'meal_id', type: 'UUID', nullable: false, primaryKey: false, foreignKey: 'meals.meal_id' },
        { id: 'ingredient_name', name: 'ingredient_name', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
        { id: 'quantity', name: 'quantity', type: 'DECIMAL(10,2)', nullable: false, primaryKey: false },
        { id: 'unit', name: 'unit', type: 'VARCHAR(50)', nullable: false, primaryKey: false },
        { id: 'estimated_cost', name: 'estimated_cost', type: 'DECIMAL(10,2)', nullable: true, primaryKey: false },
        { id: 'purchased', name: 'purchased', type: 'BOOLEAN', nullable: false, primaryKey: false },
        { id: 'purchased_by', name: 'purchased_by', type: 'UUID', nullable: true, primaryKey: false, foreignKey: 'users.user_id' },
        { id: 'notes', name: 'notes', type: 'TEXT', nullable: true, primaryKey: false }
      ],
      relationships: [
        { id: 'ingredient_meal', type: 'many-to-one', fromTable: 'meal_ingredients', toTable: 'meals', description: 'Ingredient belongs to meal' },
        { id: 'ingredient_purchaser', type: 'many-to-one', fromTable: 'meal_ingredients', toTable: 'users', description: 'Ingredient purchased by user' }
      ]
    },
    {
      id: 'users',
      name: 'users',
      description: 'User accounts and profile information',
      columns: [
        { id: 'user_id', name: 'user_id', type: 'UUID', nullable: false, primaryKey: true },
        { id: 'email', name: 'email', type: 'VARCHAR(255)', nullable: false, primaryKey: false },
        { id: 'username', name: 'username', type: 'VARCHAR(100)', nullable: false, primaryKey: false },
        { id: 'first_name', name: 'first_name', type: 'VARCHAR(100)', nullable: false, primaryKey: false },
        { id: 'last_name', name: 'last_name', type: 'VARCHAR(100)', nullable: false, primaryKey: false },
        { id: 'dietary_restrictions', name: 'dietary_restrictions', type: 'JSON', nullable: true, primaryKey: false },
        { id: 'phone', name: 'phone', type: 'VARCHAR(20)', nullable: true, primaryKey: false },
        { id: 'emergency_contact', name: 'emergency_contact', type: 'JSON', nullable: true, primaryKey: false },
        { id: 'created_at', name: 'created_at', type: 'TIMESTAMP', nullable: false, primaryKey: false },
        { id: 'updated_at', name: 'updated_at', type: 'TIMESTAMP', nullable: false, primaryKey: false }
      ],
      relationships: [
        { id: 'user_trips', type: 'one-to-many', fromTable: 'users', toTable: 'trips', description: 'User can organize trips' },
        { id: 'user_meals', type: 'one-to-many', fromTable: 'users', toTable: 'meals', description: 'User can be assigned meals' }
      ]
    }
  ]

  const getTableIcon = (tableName: string) => {
    switch (tableName) {
      case 'trips': return <MapPin className="w-4 h-4" />
      case 'meals': return <Utensils className="w-4 h-4" />
      case 'meal_ingredients': return <CheckSquare className="w-4 h-4" />
      case 'users': return <Users className="w-4 h-4" />
      default: return <Table className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    if (type.includes('UUID')) return 'text-secondary bg-muted'
    if (type.includes('VARCHAR') || type.includes('TEXT')) return 'text-primary bg-muted'
    if (type.includes('TIMESTAMP') || type.includes('DATE') || type.includes('TIME')) return 'text-primary bg-muted'
    if (type.includes('DECIMAL') || type.includes('INTEGER')) return 'text-accent bg-muted'
    if (type.includes('BOOLEAN')) return 'text-destructive bg-muted'
    if (type.includes('ENUM')) return 'text-primary bg-muted'
    if (type.includes('JSON')) return 'text-accent bg-muted'
    return 'text-mutedForeground bg-muted'
  }

  const generateSQLSchema = () => {
    return mealPlannerSchema.map(table => {
      const columns = table.columns.map(col => {
        const nullable = col.nullable ? '' : ' NOT NULL'
        const pk = col.primaryKey ? ' PRIMARY KEY' : ''
        return `  ${col.name} ${col.type}${nullable}${pk}`
      }).join(',\n')
      
      return `CREATE TABLE ${table.name} (\n${columns}\n);`
    }).join('\n\n')
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 transition-all duration-300 hover:bg-primary/20">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Meal Planner Database Schema</h1>
              <p className="text-mutedForeground text-lg mt-1">Database design for off-road trip meal planning system</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('visual')}
              aria-label="Switch to visual schema view"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                viewMode === 'visual'
                  ? 'bg-primary text-primaryForeground shadow-md'
                  : 'bg-surface text-foreground hover:bg-muted border border-border'
              }`}
            >
              Visual Schema
            </button>
            <button
              onClick={() => setViewMode('code')}
              aria-label="Switch to SQL code view"
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                viewMode === 'code'
                  ? 'bg-primary text-primaryForeground shadow-md'
                  : 'bg-surface text-foreground hover:bg-muted border border-border'
              }`}
            >
              SQL Code
            </button>
          </div>
        </div>

        {viewMode === 'visual' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Table className="w-5 h-5 text-primary" />
                  Tables
                </h2>
                <div className="space-y-2">
                  {mealPlannerSchema.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(table.id)}
                      aria-label={`Select ${table.name} table`}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        selectedTable === table.id
                          ? 'bg-primary/10 border border-primary/30 text-primary shadow-sm'
                          : 'bg-muted/50 hover:bg-muted text-foreground border border-border hover:border-primary/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getTableIcon(table.name)}
                        <div>
                          <div className="font-medium">{table.name}</div>
                          <div className="text-xs text-mutedForeground mt-1">
                            {table.columns.length} columns
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {(() => {
                const table = mealPlannerSchema.find(t => t.id === selectedTable)
                if (!table) return null

                return (
                  <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      {getTableIcon(table.name)}
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">{table.name}</h2>
                        <p className="text-mutedForeground text-sm">{table.description}</p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                        <Table className="w-4 h-4 text-primary" />
                        Columns
                      </h3>
                      <div className="space-y-3">
                        {table.columns.map((column) => (
                          <div
                            key={column.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted hover:border-primary/20 transition-all duration-300"
                          >
                            <div className="flex items-center gap-3">
                              {column.primaryKey && (
                                <Key className="w-4 h-4 text-accent" />
                              )}
                              <div>
                                <div className="font-medium text-foreground">{column.name}</div>
                                {column.foreignKey && (
                                  <div className="text-xs text-primary">
                                    FK → {column.foreignKey}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(column.type)}`}>
                                {column.type}
                              </span>
                              {!column.nullable && (
                                <span className="px-2 py-1 bg-destructive/10 text-destructive rounded text-xs font-medium border border-destructive/20">
                                  NOT NULL
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" />
                        Relationships
                      </h3>
                      <div className="space-y-3">
                        {table.relationships.map((rel) => (
                          <div
                            key={rel.id}
                            className="p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted hover:border-primary/20 transition-all duration-300"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-foreground">
                                {rel.fromTable} → {rel.toTable}
                              </div>
                              <span className="px-2 py-1 bg-secondary/10 text-secondary rounded text-xs font-medium border border-secondary/20">
                                {rel.type}
                              </span>
                            </div>
                            <p className="text-sm text-mutedForeground">{rel.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              SQL Schema
            </h2>
            <div className="bg-background rounded-lg p-4 overflow-x-auto border border-border">
              <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
                {generateSQLSchema()}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface rounded-lg border border-border p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="text-2xl font-bold text-primary">{mealPlannerSchema.length}</div>
            <div className="text-sm text-mutedForeground">Tables</div>
          </div>
          <div className="bg-surface rounded-lg border border-border p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="text-2xl font-bold text-primary">
              {mealPlannerSchema.reduce((acc, table) => acc + table.columns.length, 0)}
            </div>
            <div className="text-sm text-mutedForeground">Columns</div>
          </div>
          <div className="bg-surface rounded-lg border border-border p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="text-2xl font-bold text-primary">
              {mealPlannerSchema.reduce((acc, table) => acc + table.relationships.length, 0)}
            </div>
            <div className="text-sm text-mutedForeground">Relationships</div>
          </div>
          <div className="bg-surface rounded-lg border border-border p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="text-2xl font-bold text-primary">
              {mealPlannerSchema.reduce((acc, table) => 
                acc + table.columns.filter(col => col.foreignKey).length, 0
              )}
            </div>
            <div className="text-sm text-mutedForeground">Foreign Keys</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MealPlannerDBSchemaDemo() {
  return <MealPlannerDBSchema />
}