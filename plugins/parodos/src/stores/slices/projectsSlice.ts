import type { StateCreator } from 'zustand';
import type { ProjectsSlice, State, StateMiddleware } from '../types';
import * as urls from '../../urls';
import { unstable_batchedUpdates } from 'react-dom';
import { type Project, projectSchema } from '../../models/project';
import { FetchApi } from '@backstage/core-plugin-api';

export const createProjectsSlice: StateCreator<
  State,
  StateMiddleware,
  [],
  ProjectsSlice
> = (set, get) => ({
  projectsLoading: true,
  projectsError: undefined,
  initiallyLoaded: false,
  hasProjects() {
    return get().projects.length > 0;
  },
  projects: [],
  async fetchProjects(fetch: FetchApi['fetch']) {
    set(state => {
      state.projectsLoading = true;
    });

    try {
      const response = await fetch(`${get().baseUrl}${urls.Projects}`);
      const projectsResponse = await response.json();

      const projects = projectsResponse.map(projectSchema.parse) as Project[];

      // projectStatus.split('-').map(capitalize).join(' ')

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
