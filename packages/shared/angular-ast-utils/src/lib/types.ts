import { Root } from 'postcss';
import type { ParsedTemplate } from '@angular/compiler' with { 'resolution-mode': 'import' };
import { z } from 'zod';
import { AngularUnitSchema } from './schema';

export type Asset<T> = SourceLink & {
  parse: () => Promise<T>;
};

export type SourceLink = { filePath: string; startLine: number };

export type ParsedComponent = {
  className: string;
  fileName: string;
  startLine: number;
} & {
  templateUrl: Asset<ParsedTemplate>;
  template: Asset<ParsedTemplate>;
  styles: Asset<Root>[];
  styleUrls: Asset<Root>[];
  styleUrl: Asset<Root>;
} & {
  [key: string]: string; // @TODO implement all of the component props
};
export type AngularUnit = z.infer<typeof AngularUnitSchema>;
