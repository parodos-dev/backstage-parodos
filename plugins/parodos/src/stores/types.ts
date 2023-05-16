import { FetchApi } from '@backstage/core-plugin-api';
import type { Project } from '../models/project';
import type { WorkflowDefinition } from '../models/workflowDefinitionSchema';
import type { NotificationContent } from '../models/notification';
import type { ParodosConfig } from '../types';

export interface UISlice {
  baseUrl: string | undefined;
  setAppConfig(config: ParodosConfig): void;
  loading(): boolean;
  error(): unknown | undefined;
  getApiUrl(url: string): string;
  workflows: Pick<ParodosConfig, 'workflows'>['workflows'];
  initialized(): boolean;
}

export const predicates = {
  byId: (workflow: WorkflowDefinition) => workflow.id,
  byType: (workflow: WorkflowDefinition) => workflow.type,
  byName: (workflow: WorkflowDefinition) => workflow.name,
} as const;

export type GetDefinitionFilter = keyof typeof predicates;

export interface WorkflowSlice {
  workflowDefinitions: WorkflowDefinition[];
  getWorkDefinitionBy(
    filterBy: GetDefinitionFilter,
    value: string,
  ): WorkflowDefinition | undefined;
  fetchDefinitions(fetch: FetchApi['fetch']): Promise<void>;
  workflowDefinitionsLoading: boolean;
  workflowError: unknown | undefined;
}

export interface ProjectsSlice {
  projects: Project[];
  fetchProjects(fetch: FetchApi['fetch']): Promise<void>;
  hasProjects(): boolean;
  addProject(project: Project): void;
  projectsLoading: boolean;
  projectsError: Error | undefined;
  initiallyLoaded: boolean;
}

export type NotificationState = 'ALL' | 'UNREAD' | 'ARCHIVED';
export type NotificationOperation = 'READ' | 'ARCHIVE';
export interface NotificationsSlice {
  notifications: NotificationContent[];
  notificationsCount: number;
  setNotifications(notifications: NotificationContent[]): void;
  // fetchNotifications(params: {
  //   fetch: FetchApi['fetch'];
  //   filter: NotificationState;
  //   page: number;
  //   rowsPerPage: number;
  // }): Promise<void>;
  deleteNotifications(params: {
    fetch: FetchApi['fetch'];
    ids: string[];
  }): Promise<void>;
  setNotificationState(params: {
    fetch: FetchApi['fetch'];
    id: string;
    newState: NotificationOperation;
  }): Promise<void>;
  notificationsLoading: boolean;
  notificationsError: Error | undefined;
}

export type StateMiddleware = [
  ['zustand/immer', never],
  ['zustand/devtools', never],
];

export type State = UISlice &
  WorkflowSlice &
  ProjectsSlice &
  NotificationsSlice;
