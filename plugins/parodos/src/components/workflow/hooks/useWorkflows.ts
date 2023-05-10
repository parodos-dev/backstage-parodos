import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import useAsyncFn, { AsyncFnReturn } from 'react-use/lib/useAsyncFn';
import {
  ProjectWorkflow,
  projectWorkflowsSchema,
} from '../../../models/workflowTaskSchema';

export function useWorkflows(
  workflowsUrl: string,
): AsyncFnReturn<(projectId: string) => Promise<ProjectWorkflow[]>> {
  const { fetch } = useApi(fetchApiRef);

  return useAsyncFn(
    async (projectId: string) => {
      const data = await fetch(`${workflowsUrl}?projectId=${projectId}`);

      if (!data.ok) {
        throw new Error(`${data.status} - ${data.statusText}`);
      }

      const response = projectWorkflowsSchema.parse(await data.json());

      return response;
    },
    [fetch, workflowsUrl],
  );
}
