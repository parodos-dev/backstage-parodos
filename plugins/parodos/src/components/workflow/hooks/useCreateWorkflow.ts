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

export function useCreateWorkflow(assessment: string): AsyncFnReturn<
  (executionOptions: ExecuteWorkflow) => Promise<{
    // options: WorkflowOptionsListItem[];
    assessmentWorkflowExecutionId: string;
  }>
> {
  const executeWorkflow = useExecuteWorkflow({
    workflowDefinitionName: assessment,
  });

  return useAsyncFn(
    async (executionOptions: ExecuteWorkflow) => {
      const { workFlowExecutionId } = await executeWorkflow(executionOptions);

      // await usePollWorkflowStatus(fetch, {
      //   workflowsUrl,
      //   executionId: workFlowExecutionId,
      //   setWorkflowError,
      //   setWorkflowProgress,
      // });

      // const workflowOptions = await getWorkflowOptions(fetch, {
      //   workflowsUrl,
      //   executionId: workFlowExecutionId,
      // });

      return {
        // options: workflowOptions,
        assessmentWorkflowExecutionId: workFlowExecutionId,
      };
    },
    [executeWorkflow],
  );
}
