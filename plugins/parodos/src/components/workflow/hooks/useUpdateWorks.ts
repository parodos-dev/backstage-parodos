import { useEffect, useState } from 'react';
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

interface UpdateWorks {
  executionId: string;
}
export function useUpdateWorks({ executionId }: UpdateWorks) {
  const [workflowName, setWorkflowName] = useState<string>('');
  const [status, setStatus] = useState<Status>('IN_PROGRESS');
  const workflowsUrl = useStore(store => store.getApiUrl(urls.Workflows));
  const getWorkDefinitionBy = useStore(state => state.getWorkDefinitionBy);
  const [allTasks, setAllTasks] = useState<WorkflowTask[]>([]);
  const { fetch } = useApi(fetchApiRef);

  useEffect(() => {
    const updateWorks = (works: WorkStatus[]) => {
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
    };

    const updateWorksFromApi = async () => {
      const data = await fetch(`${workflowsUrl}/${executionId}/status`);
      const response = workflowStatusSchema.parse(
        (await data.json()) as WorkflowStatus,
      );

      if (response.status === 'FAILED') {
        setStatus(response.status);
      }

      const workflow = getWorkDefinitionBy('byName', response.workFlowName);
      if (workflow && allTasks.length === 0) {
        setAllTasks(getWorkflowTasksForTopology(workflow));
      }
      setWorkflowName(response.workFlowName);
      updateWorks(response.works);

      return response.works;
    };

    const taskInterval = setInterval(() => {
      updateWorksFromApi();
    }, 5000);

    updateWorksFromApi();

    if (status === 'FAILED') {
      clearInterval(taskInterval);
    }

    return () => clearInterval(taskInterval);
  }, [allTasks, executionId, fetch, getWorkDefinitionBy, status, workflowsUrl]);

  return { tasks: allTasks, status, workflowName };
}
