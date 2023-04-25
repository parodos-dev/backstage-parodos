import { useEffect } from 'react';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useStore } from '../stores/workflowStore/workflowStore';
import { useGetAppConfig } from '../components/api';

export const useInitializeStore = () => {
  const appConfig = useGetAppConfig();
  const setAppConfig = useStore(state => state.setAppConfig);
  const fetchProjects = useStore(state => state.fetchProjects);
  const fetchDefinitions = useStore(state => state.fetchDefinitions);
  const initialized = useStore(state => state.initialized());
  const { fetch } = useApi(fetchApiRef);

  useEffect(() => {
    setAppConfig(appConfig);

    async function initialiseStore() {
      await Promise.all([fetchProjects(fetch), fetchDefinitions(fetch)]);
    }

    initialiseStore();
  }, [appConfig, fetch, fetchDefinitions, fetchProjects, setAppConfig]);

  return {
    initialStateLoaded: initialized,
  };
};
