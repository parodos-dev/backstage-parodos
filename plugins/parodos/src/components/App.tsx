import React, { useEffect, useState } from 'react';
import { useStore } from '../stores/workflowStore/workflowStore';
import { useBackendUrl } from './api/useBackendUrl';
import { PluginRouter } from './PluginRouter';
import { Progress } from '@backstage/core-components';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useInterval } from '@patternfly/react-core';

const POLLING_INTERVAL_MILLISECONDS = 5 * 1000;

export const App = () => {
  const backendUrl = useBackendUrl();
  const setBaseUrl = useStore(state => state.setBaseUrl);
  const fetchProjects = useStore(state => state.fetchProjects);
  const fetchDefinitions = useStore(state => state.fetchDefinitions);
  const [initiallyLoaded, setInitiallyLoaded] = useState(false);
  const { fetch } = useApi(fetchApiRef);

  useEffect(() => {
    setBaseUrl(backendUrl);

    async function initialiseStore() {
      // We do not pre-fetch notifications, let's do that on demand.
      // TODO: fetch unread notificaionts count and keep it updated to render te tip to the user.
      await Promise.all([fetchProjects(fetch), fetchDefinitions(fetch)]);
      setInitiallyLoaded(true);
    }

    initialiseStore();
  }, [backendUrl, fetch, fetchDefinitions, fetchProjects, setBaseUrl]);

  useInterval(() => {
    // Assumption: the fetchProjects does not take longer then POLLING_INTERVAL
    // If needed, we can i.e. leverage state.loading to skip certain ticks
    fetchProjects(fetch);
  }, POLLING_INTERVAL_MILLISECONDS);

  return initiallyLoaded ? <PluginRouter /> : <Progress />;
};
