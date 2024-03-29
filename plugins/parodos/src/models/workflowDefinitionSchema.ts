import { z } from 'zod';

const parameterTypes = z.union([
  z.literal('string'),
  z.literal('number'),
  z.literal('boolean'),
]);

const parameterFormat = z.union([
  z.literal('password'),
  z.literal('text'),
  z.literal('email'),
  z.literal('date'),
  z.literal('number'),
  z.literal('uri'),
  z.literal('boolean'),
  z.literal('select'),
  z.literal('multi-select'),
]);

const processingType = z.union([
  z.literal('SEQUENTIAL'),
  z.literal('PARALLEL'),
]);

export const workFlowTaskParameterTypeSchema = z.object({
  description: z.string().optional(),
  required: z.boolean().optional(),
  type: parameterTypes,
  format: parameterFormat.optional(),
  minLength: z.coerce.number().optional(),
  maxLength: z.coerce.number().optional(),
  default: z.any().optional(),
  field: z.string().optional(),
  disabled: z.boolean().default(false).optional(),
  enum: z.array(z.string()).optional(),
  valueProviderName: z.string().optional(),
});

const workType = z.union([
  z.literal('TASK'),
  z.literal('WORKFLOW'),
  z.literal('CHECKER'),
]);

export type WorkType = z.infer<typeof workType>;

export const baseWorkSchema = z.object({
  id: z.string(),
  name: z.string(),
  parameters: z
    .record(z.string(), workFlowTaskParameterTypeSchema)
    .optional()
    .nullable(),
  workType,
  processingType: processingType.optional(),
  author: z.string().optional().nullable(),
  outputs: z
    .array(
      z.union([
        z.literal('EXCEPTION'),
        z.literal('HTTP2XX'),
        z.literal('NO_EXCEPTION'),
        z.literal('OTHER'),
      ]),
    )
    .optional(),
});

export type Work = z.infer<typeof baseWorkSchema> & {
  works?: Work[];
};

export const workSchema: z.ZodType<Work, z.ZodTypeDef> = baseWorkSchema.extend({
  works: z.lazy(() => workSchema.array()).optional(),
});

const workflowDefinitionType = z.union([
  z.literal('ASSESSMENT'),
  z.literal('CHECKER'),
  z.literal('INFRASTRUCTURE'),
  z.literal('ESCALATION'),
]);

export type WorkflowDefinitionType = z.infer<typeof workflowDefinitionType>;

export const workflowDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: workflowDefinitionType,
  processingType,
  author: z.string().optional().nullable(),
  createDate: z.string(),
  modifyDate: z.string(),
  parameters: z
    .record(z.string(), workFlowTaskParameterTypeSchema)
    .optional()
    .nullable(),
  works: z.array(workSchema),
});

export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

export type WorkFlowTaskParameter = z.infer<
  typeof workFlowTaskParameterTypeSchema
>;

export type ParameterFormat = WorkFlowTaskParameter['format'];
