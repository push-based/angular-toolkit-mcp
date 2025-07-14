export type BaseToolSchema = {
  cwd: string;
};

export type ToolInput<
  TSchema extends Record<
    string,
    { inputSchema: { properties: Record<string, unknown> } }
  >,
  T extends keyof TSchema,
> = {
  [K in keyof TSchema[T]['inputSchema']['properties']]: TSchema[T]['inputSchema']['properties'][K] extends {
    type: 'string';
  }
    ? string
    : TSchema[T]['inputSchema']['properties'][K] extends {
          type: 'array';
          items: { type: 'string' };
        }
      ? string[]
      : TSchema[T]['inputSchema']['properties'][K] extends {
            type: 'array';
            items: { type: 'object'; properties: Record<string, unknown> };
          }
        ? Array<{
            [P in keyof TSchema[T]['inputSchema']['properties'][K]['items']['properties']]: TSchema[T]['inputSchema']['properties'][K]['items']['properties'][P] extends {
              type: 'string';
            }
              ? string
              : TSchema[T]['inputSchema']['properties'][K]['items']['properties'][P] extends {
                    type: 'array';
                    items: { type: 'string' };
                  }
                ? string[]
                : never;
          }>
        : never;
};
export type NamedRecord<T extends string> = Record<T, { name: T }>;
