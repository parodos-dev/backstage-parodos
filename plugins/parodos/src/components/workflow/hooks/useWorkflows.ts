import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import useAsyncFn, { AsyncFnReturn } from 'react-use/lib/useAsyncFn';
import { WorkflowStatus } from '../../../models/workflowTaskSchema';

export function useWorkflows(
  workflowsUrl: string,
): AsyncFnReturn<(projectId: string) => Promise<WorkflowStatus[]>> {
  const { fetch } = useApi(fetchApiRef);

  return useAsyncFn(
    async (projectId: string) => {
      const payload = { projectId };
      // eslint-disable-next-line no-console
      console.log(payload);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // const data = await fetch(workflowsUrl, {
      //   method: 'POST',
      //   body: JSON.stringify(payload),
      // });

      // if (!data.ok) {
      //   throw new Error(`${data.status} - ${data.statusText}`);
      // }

      // const response = (await data.json()) as WorkflowStatus[];

      // return response;
      // NOTE Use mock data for now
      return [
        {
          status: 'IN_PROGRESS',
          works: [],
          workFlowName: 'ocpOnboardingWorkFlow',
          workFlowExecutionId: '25f46474-788d-482f-8ce4-546b918d7651',
        },
        {
          status: 'IN_PROGRESS',
          works: [],
          workFlowName: 'ocpOnboardingWorkFlow',
          workFlowExecutionId: '25f46474-788d-482f-8ce4-546b918d7651',
        },
      ];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetch, workflowsUrl],
  );
}
