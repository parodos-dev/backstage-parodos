import { FetchApi } from '@backstage/core-plugin-api';
import {
  WorkflowStatus,
  workflowStatusSchema,
} from '../../../models/workflowTaskSchema';
import { delay } from '../../../utils/delay';

export async function pollWorkflowStatus(
  fetch: FetchApi['fetch'],
  options: { workflowsUrl: string; executionId: string },
): Promise<WorkflowStatus['status']> {
  let status: WorkflowStatus['status'];
  do {
    const data = await fetch(
      `${options.workflowsUrl}/${options.executionId}/status`,
    );
    ({ status } = workflowStatusSchema.parse(
      (await data.json()) as WorkflowStatus,
    ));
    if (status !== 'IN_PROGRESS') {
      break;
    }
    await delay(1000);
  } while (status === 'IN_PROGRESS');

  return status;
}
