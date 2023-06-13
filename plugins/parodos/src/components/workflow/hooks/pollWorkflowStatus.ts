import { FetchApi } from '@backstage/core-plugin-api';
import {
  WorkflowStatus,
  workflowStatusSchema,
} from '../../../models/workflowTaskSchema';
import { WorkflowSlice } from '../../../stores/types';
import { delay } from '../../../utils/delay';

type PollWorkflowStatusOptions = {
  workflowsUrl: string;
  executionId: string;
} & Pick<WorkflowSlice, 'setWorkflowError'>;

export async function pollWorkflowStatus(
  fetch: FetchApi['fetch'],
  { workflowsUrl, executionId, setWorkflowError }: PollWorkflowStatusOptions,
): Promise<WorkflowStatus['status']> {
  let status: WorkflowStatus['status'];
  do {
    const data = await fetch(`${workflowsUrl}/${executionId}/status`);
    ({ status } = workflowStatusSchema.parse(
      (await data.json()) as WorkflowStatus,
    ));

    if (status === 'FAILED') {
      setWorkflowError(new Error(`workflow failed`));
      break;
    }

    if (status !== 'IN_PROGRESS') {
      break;
    }
    await delay(1000);
  } while (status === 'IN_PROGRESS');

  return status;
}
