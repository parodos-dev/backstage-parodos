import React from 'react';
import { useInterval } from '@patternfly/react-core';
import { Progress } from '@backstage/core-components';

import { useStore } from '../stores/workflowStore/workflowStore';
import { useInitializeStore } from '../hooks/useInitializeStore';
import { PluginRouter } from './PluginRouter';

const POLLING_INTERVAL_MILLISECONDS = 5 * 1000;

export const App = () => {
  const fetchProjects = useStore(state => state.fetchProjects);
  const initialStateIsLoading = useStore(state => state.loading);
  useInitializeStore();

  useInterval(() => {
    fetchProjects(fetch);
  }, POLLING_INTERVAL_MILLISECONDS);

  return initialStateIsLoading() ? <Progress /> : <PluginRouter />;
};
