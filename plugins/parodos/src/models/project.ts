import { z } from 'zod';

const projectStatus = z.union([
  z.literal('IN_PROGRESS'),
  z.literal('PENDING'),
  z.literal('REJECTED'),
  z.literal('FAILED'),
  z.literal('COMPLETED'),
]);

const accessRole = z.union([
  z.literal('OWNER'),
  z.literal('DEVELOPER'),
  z.literal('ADMIN'),
]);

const accessStatus = z.union([
  z.literal('PENDING'),
  z.literal('REJECTED'),
  z.literal('APPROVED'),
]);

export type AccessRole = z.infer<typeof accessRole>;

export type AccessStatus = z.infer<typeof accessStatus>;

export type ProjectStatus = z.infer<typeof projectStatus>;

export const projectMember = z.object({
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  roles: z.array(accessRole),
});

export const accessRequest = z.object({
  accessRequestId: z.string(),
  comment: z.string().nullable().optional(),
  firstname: z.string(),
  lastname: z.string(),
  projectId: z.string(),
  role: accessRole,
  status: accessStatus,
  username: z.string(),
});

export const projectMembers = z.array(projectMember);

export const accessRequests = z.array(accessRequest);

export type ProjectMember = z.infer<typeof projectMember>;

export type AccessRequest = z.infer<typeof accessRequest>;

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
  accessRoles: z.array(accessRole).nullable().optional(),
});

export type Project = z.infer<typeof projectSchema>;
