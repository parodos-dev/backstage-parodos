import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import useAsyncFn, { AsyncFnReturn } from 'react-use/lib/useAsyncFn';
import { fetchWorkflows } from '../../../api/fetchWorkflows';
import { ProjectWorkflow } from '../../../models/workflowTaskSchema';
import { useStore } from '../../../stores/workflowStore/workflowStore';

export function useWorkflows(): AsyncFnReturn<
  (projectId: string) => Promise<ProjectWorkflow[]>
> {
  const { fetch } = useApi(fetchApiRef);
  const baseUrl = useStore(state => state.baseUrl);

  return useAsyncFn(
    async (projectId: string) => fetchWorkflows(fetch, baseUrl, projectId),
    [fetch, baseUrl],
  );
}
