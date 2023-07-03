import { useCallback, useEffect, useState } from 'react';
import {
  Status,
  WorkflowStatus,
  workflowStatusSchema,
  WorkflowTask,
  WorkStatus,
} from '../../../models/workflowTaskSchema';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import * as urls from '../../../urls';
import { getWorkflowTasksForTopology } from '../../../hooks/getWorkflowDefinitions';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useInterval } from '@patternfly/react-core';

interface UpdateWorks {
  executionId: string;
}
export function useUpdateWorks({ executionId }: UpdateWorks): {
  tasks: WorkflowTask[];
  status: Status;
  workflowName: string;
} {
  const [workflowName, setWorkflowName] = useState<string>('');
  const [status, setStatus] = useState<Status>('IN_PROGRESS');
  const workflowsUrl = useStore(store => store.getApiUrl(urls.Workflows));
  const getWorkDefinitionBy = useStore(state => state.getWorkDefinitionBy);
  const [allTasks, setAllTasks] = useState<WorkflowTask[]>([]);
  const { fetch } = useApi(fetchApiRef);

  const updateWorks = useCallback(
    (works: WorkStatus[]) => {
      let needUpdate = false;
      const tasks = [...allTasks];
      for (const work of works) {
        if (work.type === 'TASK') {
          const foundTask = tasks.find(task => task.id === work.name);

          if (foundTask && foundTask.status !== work.status) {
            foundTask.status = work.status;
            needUpdate = true;
          }
          if (foundTask && work.alertMessage !== foundTask?.alertMessage) {
            foundTask.alertMessage = work.alertMessage;
            needUpdate = true;
          }
        } else if (work.works) {
          updateWorks(work.works);
        }
      }
      if (needUpdate) {
        setAllTasks(tasks);
      }
    },
    [allTasks],
  );

  const updateWorksFromApi = useCallback(
    async function updateWorksFromApi() {
      const data = await fetch(`${workflowsUrl}/${executionId}/status`);
      const response = workflowStatusSchema.parse(
        (await data.json()) as WorkflowStatus,
      );

      if (response.status !== 'IN_PROGRESS') {
        setStatus(response.status);
      }

      const workflow = getWorkDefinitionBy('byName', response.workFlowName);
      if (workflow && allTasks.length === 0) {
        setAllTasks(getWorkflowTasksForTopology(workflow));
      }

      setWorkflowName(response.workFlowName);
      updateWorks(response.works);

      return response.works;
    },
    [
      allTasks.length,
      executionId,
      fetch,
      getWorkDefinitionBy,
      updateWorks,
      workflowsUrl,
    ],
  );

  // setting delay to null stops useInterval
  const delay = status === 'IN_PROGRESS' ? 5000 : null;

  useInterval(() => {
    updateWorksFromApi();
  }, delay);

  useEffect(() => {
    updateWorksFromApi();
  }, [updateWorksFromApi]);

  return { tasks: allTasks, status, workflowName };
}
