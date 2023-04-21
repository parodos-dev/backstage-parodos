import { z } from 'zod';

const projectStatus = z.union([
  z.literal('IN_PROGRESS'),
  z.literal('PENDING'),
  z.literal('REJECTED'),
  z.literal('FAILED'),
  z.literal('COMPLETED')
]);

export type ProjectStatus = z.infer<typeof projectStatus>;

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createDate: z.coerce.date(),
  modifyDate: z.coerce.date(),
  username: z.string().nullable(),
  status: projectStatus.default('IN_PROGRESS').transform((value) => value.split('_').join(' ')),
});

export type Project = z.infer<typeof projectSchema>;
