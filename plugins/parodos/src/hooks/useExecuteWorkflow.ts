import assert from 'assert-ts';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useStore } from '../stores/workflowStore/workflowStore';
import { getWorkflowsPayload } from './workflowsPayload';
import { useCallback } from 'react';
import { executeWorkflow } from '../api';

export interface ExecuteWorkflow {
  projectId: string;
  formData?: Record<string, any>;
}

export function useExecuteWorkflow({
  workflowDefinitionName,
  assessmentWorkflowExecutionId,
}: {
  workflowDefinitionName: string;
  assessmentWorkflowExecutionId?: string;
}) {
  const { fetch } = useApi(fetchApiRef);
  const baseUrl = useStore(state => state.baseUrl);
  const workflow = useStore(state =>
    state.getWorkDefinitionBy('byName', workflowDefinitionName),
  );

  assert(
    !!workflow,
    `no assessmentWorkflow found for ${workflowDefinitionName}`,
  );

  return useCallback(
    async ({ projectId, formData = {} }: ExecuteWorkflow) => {
      const payload = {
        ...getWorkflowsPayload({
          projectId,
          workflow,
          schema: formData,
        }),
        invokingExecutionId:
          workflow.type !== 'ASSESSMENT' ? assessmentWorkflowExecutionId : null,
      };

      return executeWorkflow(fetch, baseUrl, payload);
    },
    [workflow, fetch, baseUrl, assessmentWorkflowExecutionId],
  );
}
