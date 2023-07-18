import {
  configApiRef,
  errorApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { urls, WorkflowDefinition } from '@parodos/plugin-parodos';
import { useEffect } from 'react';
import useAsync from 'react-use/lib/useAsync';

export function useWorkflowDefinitions() {
  const { fetch } = useApi(fetchApiRef);
  const errorApi = useApi(errorApiRef);
  const configApi = useApi(configApiRef);

  const { error: fetchWorkflowDefinitionsError, value: definitions } =
    useAsync(async () => {
      const response = await fetch(
        `${configApi.getString('backend.baseUrl')}${urls.WorkflowDefinitions}`,
      );
      return response.json() as Promise<WorkflowDefinition[]>;
    }, []);

  useEffect(() => {
    if (fetchWorkflowDefinitionsError) {
      // eslint-disable-next-line no-console
      console.error(fetchWorkflowDefinitionsError);

      errorApi.post(new Error('Fetch projects failed'));
    }
  }, [errorApi, fetchWorkflowDefinitionsError]);

  return definitions;
}
