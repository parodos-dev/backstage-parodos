import { z } from 'zod';

const status = z.union([
  z.literal('COMPLETED'),
  z.literal('IN_PROGRESS'),
  z.literal('PENDING'),
  z.literal('FAILED'),
]);

type Status = z.infer<typeof status>;

const transformedStatus = z.preprocess(
  s => String(s).toUpperCase(),
  status,
) as z.ZodType<Status, z.ZodTypeDef, string>;

export const workflowTaskSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: transformedStatus,
  runAfterTasks: z.array(z.string()),
  locked: z.boolean(),
});

export const baseWorkStatusSchema = z.object({
  name: z.string(),
  type: z.union([z.literal('TASK'), z.literal('WORKFLOW')]),
  status: transformedStatus,
  locked: z.boolean().optional().nullable(),
});

export type WorkStatus = z.infer<typeof baseWorkStatusSchema> & {
  works?: WorkStatus[];
};

type Input = z.input<typeof baseWorkStatusSchema>  & { status: string };
type Output = z.output<typeof baseWorkStatusSchema> & { status: Status };

export const workStatusSchema: z.ZodType<Output, z.ZodTypeDef, Input> =
  baseWorkStatusSchema.extend({
    works: z.lazy(() => workStatusSchema.array()).optional(),
  });

export const workflowStatusSchema = z.object({
  workFlowExecutionId: z.string(),
  workFlowName: z.string(),
  works: z.array(workStatusSchema),
  status: status.transform(s => s.toUpperCase()),
});

export type WorkflowTask = z.infer<typeof workflowTaskSchema>;

// HACK: need to work out why this is needed
export type WorkflowStatus = {[K in keyof z.infer<typeof workflowStatusSchema>]: K extends 'status' ? Status : z.infer<typeof workflowStatusSchema>[K]};
