import { unstable_batchedUpdates } from 'react-dom';
import type { StateCreator } from 'zustand';
import type { UISlice, StateMiddleware, State } from '../types';

export const createUISlice: StateCreator<
  State,
  StateMiddleware,
  [],
  UISlice
> = (set, get) => ({
  baseUrl: '',
  initiallyLoaded: false,
  pollingInterval: 0,
  workflows: {
    assessment: '',
    assessmentTask: '',
  },
  getApiUrl(url: string) {
    return `${get().baseUrl}${url}`;
  },
  setAppConfig(config) {
    set(state => {
      unstable_batchedUpdates(() => {
        state.baseUrl = config.backendUrl;
        state.workflows.assessment = config.workflows.assessment;
        state.workflows.assessmentTask = config.workflows.assessmentTask;
        state.pollingInterval = config.pollingInterval;
      }, false);
    });
  },
  loading() {
    return get().projectsLoading || get().workflowDefinitionsLoading;
  },
  initialized() {
    return get().initiallyLoaded && !get().workflowDefinitionsLoading;
  },
  error() {
    return get().workflowError ?? get().projectsError;
  },
});
