import { IChangeEvent } from '@rjsf/core-v5';
import { type StrictRJSFSchema } from '@rjsf/utils';
import { useNavigate } from 'react-router-dom';
import useAsyncFn, { type AsyncFnReturn } from 'react-use/lib/useAsyncFn';
import { useExecuteWorkflow } from '../../../hooks/useExecuteWorkflow';

interface UseStartWorkflow {
  workflowName: string;
  projectId: string;
  isNew: boolean;
  assessmentWorkflowExecutionId: string;
}

export function useStartWorkflow({
  workflowName,
  projectId,
  assessmentWorkflowExecutionId,
  isNew,
}: UseStartWorkflow): AsyncFnReturn<(e?: IChangeEvent) => Promise<void>> {
  const navigate = useNavigate();

  const executeWorkflow = useExecuteWorkflow({
    assessmentWorkflowExecutionId,
    workflowDefinitionName: workflowName,
  });

  return useAsyncFn(
    async ({ formData = {} } = {} as IChangeEvent<StrictRJSFSchema>) => {
      const { workFlowExecutionId } = await executeWorkflow({
        projectId,
        formData,
      });

      navigate(
        `/parodos/onboarding/${projectId}/${workFlowExecutionId}/workflow-detail`,
        {
          state: { isNew },
        },
      );
    },
    [projectId, navigate, isNew, executeWorkflow],
  );
}
