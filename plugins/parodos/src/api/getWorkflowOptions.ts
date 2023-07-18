import { FetchApi } from '@backstage/core-plugin-api';
import { displayableWorkflowOptions, workflowSchema } from '../models/workflow';
import { taskDisplayName } from '../utils/string';
import { WorkflowOptionsListItem } from '../components/workflow/hooks/useCreateWorkflow';

export async function getWorkflowOptions(
  fetch: FetchApi['fetch'],
  options: { workflowsUrl: string; executionId: string },
): Promise<WorkflowOptionsListItem[]> {
  const response = await fetch(
    `${options.workflowsUrl}/${options.executionId}/context?param=WORKFLOW_OPTIONS`,
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const workflowOptions = workflowSchema.parse(
    await response.json(),
  ).workFlowOptions;

  return displayableWorkflowOptions
    .flatMap(option => {
      const items = workflowOptions[option] ?? [];

      if (items.length === 0) {
        return items;
      }

      const optionType = taskDisplayName(option);

      return items.map(item => ({
        ...item,
        type: optionType,
      }));
    })
    .sort((left, right) => {
      if (left.recommended === right.recommended) {
        return left.workFlowName.localeCompare(right.workFlowName);
      }

      return left.recommended ? -1 : 0;
    }) as WorkflowOptionsListItem[];
}
