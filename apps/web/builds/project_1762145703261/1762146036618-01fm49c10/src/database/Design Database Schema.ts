/**
 * @interface TableColumn
 * @description Represents a database column definition
 */
interface TableColumn {
  name: string;
  type: string;
  nullable?: boolean;
  defaultValue?: any;
  primaryKey?: boolean;
  unique?: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
}

/**
 * @interface TableDefinition
 * @description Represents a database table definition
 */
interface TableDefinition {
  name: string;
  columns: TableColumn[];
  indexes?: {
    name: string;
    columns: string[];
    unique?: boolean;
  }[];
}

/**
 * @interface DatabaseSchema
 * @description Represents a complete database schema
 */
interface DatabaseSchema {
  name: string;
  tables: TableDefinition[];
  version: string;
}

/**
 * @class SchemaValidator
 * @description Validates database schema definitions
 */
class SchemaValidator {
  /**
   * @method validateColumn
   * @description Validates a column definition
   * @param {TableColumn} column - The column to validate
   * @throws {Error} If validation fails
   */
  private static validateColumn(column: TableColumn): void {
    if (!column.name || typeof column.name !== 'string') {
      throw new Error('Column name must be a non-empty string');
    }

    if (!column.type || typeof column.type !== 'string') {
      throw new Error('Column type must be a non-empty string');
    }

    if (column.foreignKey) {
      if (!column.foreignKey.table || !column.foreignKey.column) {
        throw new Error('Foreign key must specify both table and column');
      }
    }
  }

  /**
   * @method validateTable
   * @description Validates a table definition
   * @param {TableDefinition} table - The table to validate
   * @throws {Error} If validation fails
   */
  private static validateTable(table: TableDefinition): void {
    if (!table.name || typeof table.name !== 'string') {
      throw new Error('Table name must be a non-empty string');
    }

    if (!Array.isArray(table.columns) || table.columns.length === 0) {
      throw new Error('Table must have at least one column');
    }

    table.columns.forEach(this.validateColumn);

    if (table.indexes) {
      table.indexes.forEach(index => {
        if (!index.name || !Array.isArray(index.columns) || index.columns.length === 0) {
          throw new Error('Index must have a name and at least one column');
        }
      });
    }
  }

  /**
   * @method validateSchema
   * @description Validates an entire database schema
   * @param {DatabaseSchema} schema - The schema to validate
   * @throws {Error} If validation fails
   */
  public static validateSchema(schema: DatabaseSchema): void {
    if (!schema.name || typeof schema.name !== 'string') {
      throw new Error('Schema name must be a non-empty string');
    }

    if (!schema.version || typeof schema.version !== 'string') {
      throw new Error('Schema version must be a non-empty string');
    }

    if (!Array.isArray(schema.tables) || schema.tables.length === 0) {
      throw new Error('Schema must have at least one table');
    }

    schema.tables.forEach(this.validateTable);
  }
}

/**
 * @class SchemaBuilder
 * @description Builds database schemas
 */
class SchemaBuilder {
  private schema: DatabaseSchema;

  /**
   * @constructor
   * @param {string} name - Name of the schema
   * @param {string} version - Schema version
   */
  constructor(name: string, version: string) {
    this.schema = {
      name,
      version,
      tables: []
    };
  }

  /**
   * @method addTable
   * @description Adds a table to the schema
   * @param {TableDefinition} table - The table to add
   * @returns {SchemaBuilder} The builder instance for chaining
   */
  public addTable(table: TableDefinition): SchemaBuilder {
    this.schema.tables.push(table);
    return this;
  }

  /**
   * @method build
   * @description Builds and validates the schema
   * @returns {DatabaseSchema} The complete database schema
   * @throws {Error} If validation fails
   */
  public build(): DatabaseSchema {
    try {
      SchemaValidator.validateSchema(this.schema);
      return this.schema;
    } catch (error) {
      throw new Error(`Schema validation failed: ${error.message}`);
    }
  }
}

export {
  TableColumn,
  TableDefinition,
  DatabaseSchema,
  SchemaValidator,
  SchemaBuilder
};