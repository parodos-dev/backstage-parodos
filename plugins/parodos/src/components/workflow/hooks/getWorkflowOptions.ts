import { FetchApi } from '@backstage/core-plugin-api';
import { WorkflowOptions, workflowSchema } from '../../../models/workflow';

export async function getWorkflowOptions(
  fetch: FetchApi['fetch'],
  options: { workflowsUrl: string; executionId: string },
): Promise<Partial<WorkflowOptions>> {
  const response = await fetch(
    `${options.workflowsUrl}/${options.executionId}/context?param=WORKFLOW_OPTIONS`,
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return workflowSchema.parse(await response.json()).workFlowOptions;
}
