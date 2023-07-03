import type { StateCreator } from 'zustand';
import {
  type StateMiddleware,
  type WorkflowSlice,
  type State,
  predicates,
} from '../types';
import * as urls from '../../urls';
import { unstable_batchedUpdates } from 'react-dom';
import { FetchApi } from '@backstage/core-plugin-api';

export const createWorkflowSlice: StateCreator<
  State,
  StateMiddleware,
  [],
  WorkflowSlice
> = (set, get) => ({
  workflowDefinitions: [],
  workflowDefinitionsLoading: true,
  workflowError: undefined,
  workflowStatus: undefined,
  setWorkflowError(e) {
    set(state => {
      state.workflowError = e;
    });
  },
  setWorkflowStatus(status) {
    set(state => {
      state.workflowStatus = status;
    });
  },
  cleanUpWorkflow() {
    if (get().workflowStatus !== undefined) {
      set(state => {
        unstable_batchedUpdates(() => {
          state.workflowError = undefined;
          state.workflowStatus = undefined;
        });
      });
    }
  },
  getWorkDefinitionBy(filterBy, value) {
    const workflowDefinition = get().workflowDefinitions.find(
      def => predicates[filterBy](def) === value,
    );

    return workflowDefinition;
  },
  async fetchDefinitions(fetch: FetchApi['fetch']) {
    set(state => {
      state.workflowDefinitionsLoading = true;
    });

    try {
      const response = await fetch(
        `${get().baseUrl}${urls.WorkflowDefinitions}`,
      );
      const definitions = await response.json();

      set(state => {
        unstable_batchedUpdates(() => {
          state.workflowDefinitions = definitions;
          state.workflowDefinitionsLoading = false;
        });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('fetchDefinitions error: ', e);
      throw e;
    }
  },
});
