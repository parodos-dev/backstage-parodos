import { z } from 'zod';

export const valueProviderResponseItem = z.object({
  key: z.string(),
  options: z.array(z.string()).optional(),
  value: z.any(),
  propertyPath: z.string().optional(),
});

export const valueProviderResponseSchema = z.array(valueProviderResponseItem);

export type ValueProviderResponse = z.infer<typeof valueProviderResponseSchema>;
