import { FetchApi } from '@backstage/core-plugin-api';
import {
  WorkflowStatus,
  workflowStatusSchema,
} from '../../../models/workflowTaskSchema';
import { delay } from '../../../utils/delay';

interface PollWorkflowStatusOptions {
  workflowsUrl: string;
  executionId: string;
}

export async function pollWorkflowStatus(
  fetch: FetchApi['fetch'],
  { workflowsUrl, executionId }: PollWorkflowStatusOptions,
): Promise<WorkflowStatus['status']> {
  let status: WorkflowStatus['status'];
  do {
    const data = await fetch(`${workflowsUrl}/${executionId}/status`);
    const workflowStatus = workflowStatusSchema.parse(
      (await data.json()) as WorkflowStatus,
    );

    status = workflowStatus.status;

    if (status === 'FAILED') {
      throw new Error(`workflow failed`);
    }

    if (status !== 'IN_PROGRESS') {
      break;
    }

    if (workflowStatus.works.some(w => w.status === 'REJECTED')) {
      throw new Error(
        `A workflow task has been rejected.  Please check the logs for this task.`,
      );
    }

    await delay(1000);
  } while (status === 'IN_PROGRESS');

  return status;
}
