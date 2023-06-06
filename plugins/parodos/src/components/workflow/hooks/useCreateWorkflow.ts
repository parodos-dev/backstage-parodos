import useAsyncFn from 'react-use/lib/useAsyncFn';
import {
  displayableWorkflowOptions,
  workflowExecute,
  WorkflowOptionItem,
} from '../../../models/workflow';
import * as urls from '../../../urls';
import { taskDisplayName } from '../../../utils/string';
import { type Project } from '../../../models/project';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { getWorkflowOptions } from './getWorkflowOptions';
import { pollWorkflowStatus } from './pollWorkflowStatus';
import { getWorklfowsPayload } from './workflowsPayload';
import assert from 'assert-ts';

export type WorkflowOptionsListItem = WorkflowOptionItem & { type: string };

export interface ProjectsPayload {
  name?: string;
  description?: string;
  newProject: boolean;
  project?: Project;
}

export function useCreateWorkflow({
  assessment,
}: {
  assessment: string;
  assessmentTask: string;
}) {
  const workflowsUrl = useStore(state => state.getApiUrl(urls.Workflows));
  const assessmentWorkflow = useStore(state =>
    state.getWorkDefinitionBy('byName', assessment),
  );

  assert(!!assessmentWorkflow, `no assessmentWorkflow found for ${assessment}`);

  const { fetch } = useApi(fetchApiRef);

  return useAsyncFn(
    async ({
      project,
      formData,
    }: {
      project: Project;
      formData: Record<string, ProjectsPayload>;
    }) => {
      const payload = getWorklfowsPayload({
        projectId: project.id,
        workflow: assessmentWorkflow,
        schema: formData,
      });

      // TODO:  task here should be dynamic based on assessment workflow definition
      const workFlowResponse = await fetch(workflowsUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!workFlowResponse.ok) {
        throw new Error(workFlowResponse.statusText);
      }

      const workflow = workflowExecute.parse(await workFlowResponse.json());

      await pollWorkflowStatus(fetch, {
        workflowsUrl,
        executionId: workflow.workFlowExecutionId,
      });
      const workflowOptions = await getWorkflowOptions(fetch, {
        workflowsUrl,
        executionId: workflow.workFlowExecutionId,
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

      return options;
    },
    [assessmentWorkflow, fetch, workflowsUrl],
  );
}
