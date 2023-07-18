import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useCallback } from 'react';
import {
  executeWorkflow,
  getWorkflowsPayload,
  WorkflowDefinition,
} from '@parodos/plugin-parodos';

export interface ExecuteWorkflow {
  projectId: string;
  formData?: Record<string, any>;
}

export function useExecuteWorkflow({
  workflowDefinition,
  assessmentWorkflowExecutionId,
}: {
  workflowDefinition: WorkflowDefinition;
  assessmentWorkflowExecutionId?: string;
}) {
  const { fetch } = useApi(fetchApiRef);
  const configApi = useApi(configApiRef);
  const baseUrl = configApi.getString('backend.baseUrl');

  return useCallback(
    async ({ projectId, formData = {} }: ExecuteWorkflow) => {
      const payload = {
        ...getWorkflowsPayload({
          projectId,
          workflow: workflowDefinition,
          schema: formData,
        }),
        invokingExecutionId:
          workflowDefinition.type !== 'ASSESSMENT'
            ? assessmentWorkflowExecutionId
            : null,
      };

      return executeWorkflow(fetch, baseUrl, payload);
    },
    [workflowDefinition, fetch, baseUrl, assessmentWorkflowExecutionId],
  );
}
