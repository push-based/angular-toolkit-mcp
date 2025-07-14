import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export const buildText = (
  text: string,
  isError = false,
): CallToolResult['content'][0] => {
  return {
    type: 'text',
    text,
    isError,
  };
};

export const buildTextResponse = (texts: string[]): CallToolResult => {
  return {
    content: [...texts.map((text) => buildText(text, false))],
  };
};

export const throwError = (text: string): CallToolResult => {
  return {
    content: [buildText(text, true)],
  };
};
