import type { StateCreator } from 'zustand';
import type { ProjectsSlice, State, StateMiddleware } from '../types';
import * as urls from '../../urls';
import { unstable_batchedUpdates } from 'react-dom';
import { type Project, projectSchema } from '../../models/project';
import { FetchApi } from '@backstage/core-plugin-api';
import { assert } from 'assert-ts';

export const createProjectsSlice: StateCreator<
  State,
  StateMiddleware,
  [],
  ProjectsSlice
> = (set, get) => ({
  projectsLoading: true,
  projectsError: undefined,
  initiallyLoaded: false,
  projectsPollingInterval: 5000,
  hasProjects() {
    return get().projects.length > 0;
  },
  getProjectById(projectId: string | null) {
    assert(!!projectId, `no project search param`);

    const project = get().projects.find(p => p.id === projectId);

    assert(!!project, `no project found for id ${projectId}`);

    return project;
  },
  projects: [],
  async fetchProjects(fetch: FetchApi['fetch']) {
    set(state => {
      state.projectsLoading = true;
    });

    try {
      const response = await fetch(`${get().baseUrl}${urls.Projects}`);
      const projectsResponse = await response.json();

      if ('error' in projectsResponse) {
        throw new Error(`${projectsResponse.error}: ${projectsResponse.path}`);
      }

      const projects = (projectsResponse?.map(projectSchema.parse) ??
        []) as Project[];

      const existing = new Set(get().projects.map(p => p.id));

      const newProjects = new Set(projects.map(p => p.id));

      if (
        get().initiallyLoaded &&
        existing.size === newProjects.size &&
        [...newProjects].every(id => existing.has(id))
      ) {
        return;
      }

      set(state => {
        unstable_batchedUpdates(() => {
          state.projects = projects;
          state.projectsLoading = false;
          if (state.initiallyLoaded === false) {
            state.initiallyLoaded = true;
          }
        });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('fetchProjects error: ', e);
      set(state => {
        state.projectsError = e as Error;
      });
    }
  },
  addProject(project) {
    set(state => {
      state.projects.push(project);
    });
  },
});
