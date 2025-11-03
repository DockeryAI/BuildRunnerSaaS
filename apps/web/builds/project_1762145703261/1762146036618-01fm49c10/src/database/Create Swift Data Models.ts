/**
 * @interface SwiftDataModel
 * @description Base interface for Swift data model properties
 */
interface SwiftDataModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @class SwiftModelGenerator
 * @description Generates Swift data model classes with proper attributes and formatting
 */
export class SwiftModelGenerator {
  private static readonly swiftHeader = `import Foundation\n`;

  /**
   * @method generateModel
   * @description Generates a Swift model class from a TypeScript interface
   * @param modelName Name of the model class
   * @param properties Model properties and their types
   * @returns Generated Swift class code as string
   * @throws Error if invalid model name or properties
   */
  public static generateModel(modelName: string, properties: Record<string, string>): string {
    try {
      this.validateModelName(modelName);
      this.validateProperties(properties);

      const modelCode = [
        this.swiftHeader,
        `@objc(${modelName})`,
        `class ${modelName}: NSManagedObject {`,
        this.generateProperties(properties),
        '}\n',
        this.generateExtension(modelName)
      ].join('\n');

      return modelCode;
    } catch (error) {
      throw new Error(`Failed to generate Swift model: ${error.message}`);
    }
  }

  /**
   * @private
   * @method validateModelName
   * @description Validates the Swift model class name
   * @param name Model name to validate
   * @throws Error if name is invalid
   */
  private static validateModelName(name: string): void {
    if (!name || !/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
      throw new Error('Invalid model name. Must start with capital letter and contain only alphanumeric characters');
    }
  }

  /**
   * @private
   * @method validateProperties
   * @description Validates the model properties
   * @param properties Properties object to validate
   * @throws Error if properties are invalid
   */
  private static validateProperties(properties: Record<string, string>): void {
    if (!properties || Object.keys(properties).length === 0) {
      throw new Error('Properties cannot be empty');
    }

    for (const [key, value] of Object.entries(properties)) {
      if (!key || !value) {
        throw new Error('Invalid property name or type');
      }
    }
  }

  /**
   * @private
   * @method generateProperties
   * @description Generates Swift property declarations
   * @param properties Properties to generate
   * @returns Property declarations string
   */
  private static generateProperties(properties: Record<string, string>): string {
    return Object.entries(properties)
      .map(([name, type]) => {
        const swiftType = this.mapTypeToSwift(type);
        return `    @NSManaged public var ${name}: ${swiftType}`;
      })
      .join('\n');
  }

  /**
   * @private
   * @method generateExtension
   * @description Generates Swift class extension with convenience methods
   * @param modelName Name of the model class
   * @returns Extension code string
   */
  private static generateExtension(modelName: string): string {
    return [
      `extension ${modelName} {`,
      '    @nonobjc public class func fetchRequest() -> NSFetchRequest<' + modelName + '> {',
      `        return NSFetchRequest<${modelName}>(entityName: "${modelName}")`,
      '    }',
      '}\n'
    ].join('\n');
  }

  /**
   * @private
   * @method mapTypeToSwift
   * @description Maps TypeScript types to Swift types
   * @param type TypeScript type to convert
   * @returns Corresponding Swift type
   */
  private static mapTypeToSwift(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'String',
      'number': 'Double',
      'boolean': 'Bool',
      'Date': 'Date',
      'any': 'Any',
      'undefined': 'Any?',
      'null': 'Any?'
    };

    return typeMap[type.toLowerCase()] || type;
  }
}

/**
 * @function createSwiftModel
 * @description Creates a new Swift data model with base properties
 * @param modelName Name of the model
 * @param customProperties Additional model properties
 * @returns Generated Swift model code
 * @throws Error if model creation fails
 */
export function createSwiftModel(
  modelName: string, 
  customProperties: Record<string, string> = {}
): string {
  try {
    const baseProperties: Record<string, string> = {
      id: 'String',
      createdAt: 'Date',
      updatedAt: 'Date'
    };

    const allProperties = {
      ...baseProperties,
      ...customProperties
    };

    return SwiftModelGenerator.generateModel(modelName, allProperties);
  } catch (error) {
    throw new Error(`Failed to create Swift model: ${error.message}`);
  }
}