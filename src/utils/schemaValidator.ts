import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../schema/buildSpec.schema.json' with { type: 'json' };

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export const validateBuildSpec = ajv.compile(schema);

export function validateSpec(data: any): { valid: boolean; errors?: string[] } {
  const valid = validateBuildSpec(data);
  if (!valid) {
    return {
      valid: false,
      errors: validateBuildSpec.errors?.map(err => 
        `${err.instancePath} ${err.message}`
      ) || ['Unknown validation error']
    };
  }
  return { valid: true };
}
