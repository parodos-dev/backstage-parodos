import { FetchApi } from '@backstage/core-plugin-api';
import type { Project } from '../models/project';
import type { WorkflowDefinition } from '../models/workflowDefinitionSchema';
import type { NotificationContent } from '../models/notification';
import type { ParodosConfig } from '../types';
import { Status, WorkflowStatus } from '../models/workflowTaskSchema';

export interface UISlice {
  baseUrl: string;
  setAppConfig(config: ParodosConfig): void;
  loading(): boolean;
  error(): unknown | undefined;
  getApiUrl(url: string): string;
  workflows: Pick<ParodosConfig, 'workflows'>['workflows'];
  initialized(): boolean;
  pollingInterval: number;
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
  workflowStatus: Status | undefined;
  workflowError: unknown | undefined;
  cleanUpWorkflow(): void;
  setWorkflowError(e: unknown | undefined): void;
  setWorkflowStatus(status: Status): void;
}

export interface ProjectsSlice {
  projects: Project[];
  requestAccessStatuses: Record<
    string,
    { projectId: string; status: WorkflowStatus['status'] }
  >;
  fetchProjects(fetch: FetchApi['fetch'], force?: boolean): Promise<void>;
  fetchRequestAccessStatuses(fetch: FetchApi['fetch']): Promise<void>;
  hasProjects(): boolean;
  addProject(project: Project): void;
  projectsLoading: boolean;
  fetchingRequestAccessStatuses: boolean;
  projectsError: Error | undefined;
  initiallyLoaded: boolean;
  getProjectById(projectId: string | null): Project;
  addRequestAccessWorkflowExecutionId(
    projectId: string,
    executionId: string,
  ): void;
}

export type NotificationState = 'ALL' | 'UNREAD' | 'ARCHIVED';
export type NotificationOperation = 'READ' | 'ARCHIVE' | 'UNARCHIVE';
export interface NotificationsSlice {
  notifications: Map<string, NotificationContent>;
  notificationsCount: number;
  unreadNotificationsCount: number;
  fetchUnreadNotificationsCount(fetch: FetchApi['fetch']): Promise<void>;
  fetchNotifications(params: {
    fetch: FetchApi['fetch'];
    filter: NotificationState;
    search: string;
    page: number;
    rowsPerPage: number;
  }): Promise<void>;
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
