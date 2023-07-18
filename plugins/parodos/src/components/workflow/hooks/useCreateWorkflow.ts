import useAsyncFn, { AsyncFnReturn } from 'react-use/lib/useAsyncFn';
import { WorkflowOptionItem } from '../../../models/workflow';
import type { Project } from '../../../models/project';
import {
  ExecuteWorkflow,
  useExecuteWorkflow,
} from '../../../hooks/useExecuteWorkflow';

export type WorkflowOptionsListItem = WorkflowOptionItem & { type: string };

export interface ProjectsPayload {
  name?: string;
  description?: string;
  newProject: boolean;
  project?: Project;
}

// TODO Replace
export function useCreateWorkflow(assessment: string): AsyncFnReturn<
  (executionOptions: ExecuteWorkflow) => Promise<{
    assessmentWorkflowExecutionId: string;
  }>
> {
  const executeWorkflow = useExecuteWorkflow({
    workflowDefinitionName: assessment,
  });

  return useAsyncFn(
    async (executionOptions: ExecuteWorkflow) => {
      const { workFlowExecutionId } = await executeWorkflow(executionOptions);

      return {
        assessmentWorkflowExecutionId: workFlowExecutionId,
      };
    },
    [executeWorkflow],
  );
}
