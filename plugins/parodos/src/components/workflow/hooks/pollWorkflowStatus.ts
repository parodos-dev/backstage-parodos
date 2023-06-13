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
} & Pick<WorkflowSlice, 'setWorkflowError' | 'setWorkflowProgress'>;

export async function pollWorkflowStatus(
  fetch: FetchApi['fetch'],
  {
    workflowsUrl,
    executionId,
    setWorkflowError,
    setWorkflowProgress,
  }: PollWorkflowStatusOptions,
): Promise<WorkflowStatus['status']> {
  let status: WorkflowStatus['status'];
  let previousProgress = -1;
  do {
    const data = await fetch(`${workflowsUrl}/${executionId}/status`);
    const workflowStatus = workflowStatusSchema.parse(
      (await data.json()) as WorkflowStatus,
    );

    status = workflowStatus.status;

    if (status === 'FAILED') {
      setWorkflowError(new Error(`workflow failed`));
      break;
    }

    if (status !== 'IN_PROGRESS') {
      break;
    }

    const completed = workflowStatus.works.reduce(
      (acc, work) => (work.status === 'COMPLETED' ? acc + 1 : acc),
      0,
    );

    const progress = Math.round(
      (completed / workflowStatus.works.length) * 100,
    );

    if (previousProgress >= progress) {
      if (previousProgress < 99) {
        previousProgress += 0.5;
      }
    } else {
      previousProgress = progress;
    }

    setWorkflowProgress(Math.max(progress, previousProgress));

    await delay(1000);
  } while (status === 'IN_PROGRESS');

  return status;
}
