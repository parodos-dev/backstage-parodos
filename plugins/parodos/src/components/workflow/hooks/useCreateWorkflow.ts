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

export type WorkflowOptionsListItem = WorkflowOptionItem & { type: string };

export interface ProjectsPayload {
  name?: string;
  description?: string;
  newProject: boolean;
  project?: Project;
}

export function useCreateWorkflow({assessment, assessmentTask}: { assessment: string; assessmentTask: string }) {
  const workflowsUrl = useStore(state => state.getApiUrl(urls.Workflows));
  const { fetch } = useApi(fetchApiRef);

  return useAsyncFn(
    async ({
      workflowProject,
      formData,
    }: {
      workflowProject: Project;
      formData: Record<string, ProjectsPayload>;
    }) => {
      delete formData[assessmentTask].project;

      // TODO:  task here should be dynamic based on assessment workflow definition
      const workFlowResponse = await fetch(workflowsUrl, {
        method: 'POST',
        body: JSON.stringify({
          projectId: workflowProject.id,
          workFlowName: assessment,
          works: [
            {
              type: 'TASK',
              workName: assessmentTask,
              arguments: Object.entries(formData[assessmentTask]).map(
                ([key, value]) => {
                  return {
                    key: key,
                    value: value,
                  };
                },
              ),
            },
          ],
        }),
      });

      if (!workFlowResponse.ok) {
        throw new Error(workFlowResponse.statusText);
      }

      const workflow = workflowExecute.parse(await workFlowResponse.json());

      await pollWorkflowStatus(fetch, { workflowsUrl, executionId: workflow.workFlowExecutionId });
      const workflowOptions = await getWorkflowOptions(fetch, { workflowsUrl, executionId: workflow.workFlowExecutionId });

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
    [assessment, assessmentTask, fetch, workflowsUrl],
  );
}
