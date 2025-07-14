import { JsonObject } from '@angular-devkit/core';
import { ToolSchemaOptions } from '@push-based/models';
import schemaJson from '@angular/cli/lib/config/schema.json';

export interface SchemaProperty {
  type: string;
  description: string;
  enum?: string[];
  default?: any;
  alias?: string;
  format?: string;
  visible?: boolean;
  oneOf?: JsonObject[];
  $default?: {
    $source: string;
    index?: number;
  };
}

export interface SchemaDefinition {
  title: string;
  type: string;
  description: string;
  additionalProperties: boolean;
  properties: {
    [key: string]: SchemaProperty;
  };
}

/**
 * Transforms an Angular CLI schema definition into MCP parameters.
 * This is useful for converting Angular schematics options into the standard MCP format.
 *
 * @param schema - The Angular CLI schema definition to transform
 * @returns An array of Parameter objects conforming to the MCP specification
 *
 * @example
 * ```typescript
 * const componentSchema = {
 *   title: "Angular Component Options Schema",
 *   type: "object",
 *   description: "Creates a new Angular component",
 *   properties: {
 *     name: {
 *       type: "string",
 *       description: "The name of the component"
 *     }
 *   }
 * };
 *
 * const parameters = transformSchemaToMCPParameters(componentSchema);
 * ```
 */
export function transformSchemaToMCPParameters(
  schema: SchemaDefinition,
): ToolSchemaOptions {
  return {
    name: anglarSchemaToMcpToolTitle(schema.title),
    description: schema.description,
    inputSchema: {
      type: 'object',
      properties: {
        ...Object.keys(schema.properties).reduce(
          (acc, key) => {
            const value = schema.properties[key];

            const type = mapAngularTypeToMCPType(value.type);

            if (type !== 'array') {
              acc[key] = {
                type: mapAngularTypeToMCPType(value.type),
                description: value.description,
                enum: value.enum,
                default: value.default?.toString(),
                required: !('default' in value) && !value.$default,
              } as ToolSchemaOptions['inputSchema']['properties'];
            }
            //
            // if (type === 'object') {
            //   console.log(value);
            // }

            return acc;
          },
          {} as Record<string, ToolSchemaOptions['inputSchema']['properties']>,
        ),
      },
    },
  } satisfies ToolSchemaOptions;
}

/**
 * Converts an Angular schema name to a more user-friendly title for MCP tools.
 * @example
 *
 * ```typescript
 * const title = anglarSchemaToMcpToolTitle('Angular_Class_Options_Schema');
 * console.log(title); // Output: "Angular Class Generator"
 * ```
 */
function anglarSchemaToMcpToolTitle(schemaName: string): string {
  const title = schemaName
    .replace(/ Options Schema/g, '')
    .toLowerCase()
    .replace(' ', '_');
  return `${title}_generator`;
}

/**
 * Maps Angular schema types to MCP parameter types.
 *
 * @param angularType - The type from the Angular schema
 * @returns The corresponding MCP parameter type
 */
function mapAngularTypeToMCPType(angularType: string): string {
  const typeMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    integer: 'integer',
    boolean: 'boolean',
    array: 'array',
    object: 'object',
  };

  return typeMap[angularType] || 'string';
}

export function generateMcpSchemaForEachSchematic(): Record<
  string,
  ToolSchemaOptions
> {
  const schematics = schemaJson.definitions.schematicOptions.properties;
  const schematicsKeys = Object.keys(schematics) as Array<
    keyof typeof schematics
  >;

  const toolSchemaOptions: Record<string, ToolSchemaOptions> = {};

  for (const key of schematicsKeys) {
    const schematicName = schematics[key]['$ref'].replace(
      '#/definitions/',
      '',
    ) as keyof typeof schemaJson.definitions;
    toolSchemaOptions[key] = transformSchemaToMCPParameters(
      schemaJson.definitions[schematicName] as SchemaDefinition,
    );
  }
  return toolSchemaOptions;
}
