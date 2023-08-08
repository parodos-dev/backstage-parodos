import { z } from 'zod';

const projectStatus = z.union([
  z.literal('IN_PROGRESS'),
  z.literal('PENDING'),
  z.literal('REJECTED'),
  z.literal('FAILED'),
  z.literal('COMPLETED'),
]);

const accessRole = z.union([
  z.literal('Owner'),
  z.literal('Developer'),
  z.literal('Admin'),
]);

export type AccessRole = z.infer<typeof accessRole>;

export type ProjectStatus = z.infer<typeof projectStatus>;

export const projectMember = z.object({
  firstName: z.string(),
  lastName: z.string(),
  roles: z.array(accessRole),
});

export const projectMembers = z.array(projectMember);

export type ProjectMember = z.infer<typeof projectMember>;

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  createdDate: z.coerce.date(),
  modifiedDate: z.coerce.date(),
  status: projectStatus
    .default('IN_PROGRESS')
    .transform(value => value.split('_').join(' ')),
  modifiedBy: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  accessRole: accessRole.nullable().optional(),
});

export type Project = z.infer<typeof projectSchema>;
