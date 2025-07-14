import { z } from 'zod';

export const AngularUnitSchema = z.enum([
  'component',
  'pipe',
  'directive',
  'service',
]);
