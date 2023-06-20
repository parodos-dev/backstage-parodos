import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import useAsyncFn, { type AsyncFnReturn } from 'react-use/lib/useAsyncFn';
import { useExecuteWorkflow } from '../../../hooks/useExecuteWorkflow';
import { useStore } from '../../../stores/workflowStore/workflowStore';

export function useRequestAccess(): AsyncFnReturn<
  (projectId: string) => Promise<void>
> {
  const addRequestAccessWorkflowExecutionId = useStore(
    state => state.addRequestAccessWorkflowExecutionId,
  );
  const identityApi = useApi(identityApiRef);
  const executeWorkflow = useExecuteWorkflow({
    workflowDefinitionName: 'projectAccessRequestWorkFlow',
  });

  return useAsyncFn(
    async (projectId: string) => {
      const { displayName } = await identityApi.getProfileInfo();
      const { workFlowExecutionId } = await executeWorkflow({
        projectId,
        formData: {
          projectAccessRequestWorkFlowTask: { USERNAME: displayName },
        },
      });

      addRequestAccessWorkflowExecutionId(projectId, workFlowExecutionId);
    },
    [executeWorkflow, identityApi, addRequestAccessWorkflowExecutionId],
  );
}
