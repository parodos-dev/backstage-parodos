import { useEffect } from 'react';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useStore } from '../stores/workflowStore/workflowStore';
import { useGetAppConfig } from '../components/api';
import { assert } from 'assert-ts';

export const useInitializeStore = () => {
  const appConfig = useGetAppConfig();
  const setAppConfig = useStore(state => state.setAppConfig);
  const fetchProjects = useStore(state => state.fetchProjects);
  const fetchDefinitions = useStore(state => state.fetchDefinitions);
  const initialized = useStore(state => state.initialized());
  const { fetch } = useApi(fetchApiRef);
  const workflowDefinitions = useStore(state => state.workflowDefinitions);
  const getWorkDefinitionBy = useStore(state => state.getWorkDefinitionBy);

  useEffect(() => {
    setAppConfig(appConfig);

    async function initialiseStore() {
      await Promise.all([fetchProjects(fetch), fetchDefinitions(fetch)]);
    }

    initialiseStore();
  }, [appConfig, fetch, fetchDefinitions, fetchProjects, setAppConfig]);

  useEffect(() => {
    if (workflowDefinitions.length === 0) {
      return;
    }

    const { assessment } = appConfig.workflows;

    const assessmentWorkflow = getWorkDefinitionBy('byName', assessment);

    assert(
      !!assessmentWorkflow,
      `invalid workflow config for assessment ${assessment}`,
    );
  }, [appConfig.workflows, getWorkDefinitionBy, workflowDefinitions]);

  return {
    initialStateLoaded: initialized,
  };
};
