import { useEffect } from 'react';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useStore } from '../stores/workflowStore/workflowStore';
import { useGetAppConfig } from '../components/api';

export const useInitializeStore = () => {
  const appConfig = useGetAppConfig();
  const setAppConfig = useStore(state => state.setAppConfig);
  const fetchProjects = useStore(state => state.fetchProjects);
  const fetchDefinitions = useStore(state => state.fetchDefinitions);
  const { fetch } = useApi(fetchApiRef);

  useEffect(() => {
    setAppConfig(appConfig);

    async function initialiseStore() {
      // We do not pre-fetch notifications, let's do that on demand.
      // TODO: fetch unread notificaionts count and keep it updated to render te tip to the user.
      await Promise.all([fetchProjects(fetch), fetchDefinitions(fetch)]);
    }

    initialiseStore();
  }, [appConfig, fetch, fetchDefinitions, fetchProjects, setAppConfig]);
};
