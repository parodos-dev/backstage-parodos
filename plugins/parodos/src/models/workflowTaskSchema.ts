import { z } from 'zod';

const status = z.union([
  z.literal('COMPLETED'),
  z.literal('IN_PROGRESS'),
  z.literal('PENDING'),
  z.literal('FAILED'),
  z.literal('REJECTED'),
]);

export type Status = z.infer<typeof status>;

const transformedStatus = z.preprocess(s => String(s).toUpperCase(), status);

export const workflowTaskSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: transformedStatus,
  runAfterTasks: z.array(z.string()),
  locked: z.boolean(),
  alertMessage: z.string().nullable().optional(),
});

export const baseWorkStatusSchema = z.object({
  name: z.string(),
  type: z.union([z.literal('TASK'), z.literal('WORKFLOW')]),
  status: transformedStatus,
  locked: z.boolean().optional().nullable(),
  alertMessage: z.string().nullable().optional(),
});

export type WorkStatus = z.infer<typeof baseWorkStatusSchema> & {
  works?: WorkStatus[];
};

type Input = z.input<typeof baseWorkStatusSchema> & { works?: Input[] };
type Output = z.output<typeof baseWorkStatusSchema> & { works?: Output[] };

export const workStatusSchema: z.ZodType<Output, z.ZodTypeDef, Input> =
  baseWorkStatusSchema.extend({
    works: z.lazy(() => workStatusSchema.array()).optional(),
  });

export const workflowStatusSchema = z.object({
  workFlowExecutionId: z.string(),
  workFlowName: z.string(),
  works: z.array(workStatusSchema),
  status: transformedStatus,
});

export const additionalInfoSchema = z.object({
  key: z.string(),
  value: z.string().optional().nullable(),
});

export const projectWorkflowSchema = z.object({
  workFlowExecutionId: z.string(),
  projectId: z.string(),
  workFlowName: z.string(),
  workStatus: transformedStatus,
  startDate: z.string(),
  endDate: z.string().optional(),
  executeBy: z.string(),
  additionalInfos: z.array(additionalInfoSchema).optional().nullable(),
});

export const projectWorkflowsSchema = z.array(projectWorkflowSchema);

export type ProjectWorkflow = z.infer<typeof projectWorkflowSchema>;

export type WorkflowTask = z.infer<typeof workflowTaskSchema>;

export type WorkflowStatus = z.infer<typeof workflowStatusSchema>;
