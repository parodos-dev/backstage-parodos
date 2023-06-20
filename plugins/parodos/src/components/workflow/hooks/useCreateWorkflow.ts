import useAsyncFn, { AsyncFnReturn } from 'react-use/lib/useAsyncFn';
import {
  displayableWorkflowOptions,
  WorkflowOptionItem,
} from '../../../models/workflow';
import * as urls from '../../../urls';
import { taskDisplayName } from '../../../utils/string';
import type { Project } from '../../../models/project';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { getWorkflowOptions } from './getWorkflowOptions';
import { pollWorkflowStatus } from './pollWorkflowStatus';
import {
  ExecuteWorkflow,
  useExecuteWorkflow,
} from '../../../hooks/useExecuteWorkflow';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';

export type WorkflowOptionsListItem = WorkflowOptionItem & { type: string };

export interface ProjectsPayload {
  name?: string;
  description?: string;
  newProject: boolean;
  project?: Project;
}

export function useCreateWorkflow(assessment: string): AsyncFnReturn<
  (executionOptions: ExecuteWorkflow) => Promise<{
    options: WorkflowOptionsListItem[];
    assessmentWorkflowExecutionId: string;
  }>
> {
  const setWorkflowError = useStore(state => state.setWorkflowError);
  const setWorkflowProgress = useStore(state => state.setWorkflowProgress);
  const { fetch } = useApi(fetchApiRef);
  const workflowsUrl = useStore(state => state.getApiUrl(urls.Workflows));
  const executeWorkflow = useExecuteWorkflow({
    workflowDefinitionName: assessment,
  });

  return useAsyncFn(
    async (executionOptions: ExecuteWorkflow) => {
      const { workFlowExecutionId } = await executeWorkflow(executionOptions);

      await pollWorkflowStatus(fetch, {
        workflowsUrl,
        executionId: workFlowExecutionId,
        setWorkflowError,
        setWorkflowProgress,
      });

      const workflowOptions = await getWorkflowOptions(fetch, {
        workflowsUrl,
        executionId: workFlowExecutionId,
      });

      const options = displayableWorkflowOptions.flatMap(option => {
        const items = workflowOptions[option] ?? [];

        if (items.length === 0) {
          return items;
        }

        const optionType = taskDisplayName(option);

        return items.map(item => ({
          ...item,
          type: optionType,
        }));
      }) as WorkflowOptionsListItem[];

      return { options, assessmentWorkflowExecutionId: workFlowExecutionId };
    },
    [
      executeWorkflow,
      fetch,
      setWorkflowError,
      setWorkflowProgress,
      workflowsUrl,
    ],
  );
}
