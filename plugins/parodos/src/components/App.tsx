import React, { useEffect } from 'react';
import { useInterval } from '@patternfly/react-core';
import { Progress } from '@backstage/core-components';

import { useStore } from '../stores/workflowStore/workflowStore';
import { useInitializeStore } from '../hooks/useInitializeStore';
import { PluginRouter } from './PluginRouter';
import { errorApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';

const POLLING_INTERVAL_MILLISECONDS = 5 * 1000;

export const App = () => {
  const fetchProjects = useStore(state => state.fetchProjects);
  const { fetch } = useApi(fetchApiRef);
  const errorApi = useApi(errorApiRef);
  const projectError = useStore(state => state.projectsError);

  const { initialStateLoaded } = useInitializeStore();

  useEffect(() => {
    if (!projectError) {
      return;
    }

    // eslint-disable-next-line no-console
    console.error(projectError);

    errorApi.post(new Error(`Internal server error.`));
  }, [errorApi, projectError]);

  useInterval(() => {
    if (!initialStateLoaded) {
      return;
    }

    fetchProjects(fetch);
  }, POLLING_INTERVAL_MILLISECONDS);

  return initialStateLoaded ? <PluginRouter /> : <Progress />;
};
