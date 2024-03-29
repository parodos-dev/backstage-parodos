import { useCallback, useEffect, useRef, useState } from 'react';
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
import { assert } from 'assert-ts';

interface UpdateWorks {
  executionId: string;
}
export function useUpdateWorks({ executionId }: UpdateWorks): {
  tasks: WorkflowTask[];
  workflowStatus: Status;
  workflowName: string;
} {
  const workflowStatus = useStore(
    state => state.workflowStatus ?? 'IN_PROGRESS',
  );
  const setWorkflowStatus = useStore(state => state.setWorkflowStatus);
  const setWorkflowError = useStore(state => state.setWorkflowError);
  const cleanUpWorkflow = useStore(state => state.cleanUpWorkflow);
  const [workflowName, setWorkflowName] = useState<string>('');
  const workflowsUrl = useStore(store => store.getApiUrl(urls.Workflows));
  const getWorkDefinitionBy = useStore(state => state.getWorkDefinitionBy);
  const [allTasks, setAllTasks] = useState<WorkflowTask[]>([]);
  const { fetch } = useApi(fetchApiRef);
  const isLoading = useRef(false);
  const allTasksRef = useRef<WorkflowTask[]>([]);

  const updateWorks = useCallback((works: WorkStatus[]) => {
    let needUpdate = false;
    const tasks = allTasksRef.current;
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
      setAllTasks([...tasks]);
    }
  }, []);

  const updateWorksFromApi = useCallback(
    async function updateWorksFromApi() {
      if (isLoading.current) return;

      isLoading.current = true;
      const data = await fetch(`${workflowsUrl}/${executionId}/status`);
      const response = workflowStatusSchema.parse(
        (await data.json()) as WorkflowStatus,
      );

      if (response.status !== 'IN_PROGRESS') {
        setWorkflowStatus(response.status);
      }

      if (response.status === 'FAILED') {
        setWorkflowError(new Error(response.message ?? undefined));
      }

      if (response.works.some(w => w.status === 'REJECTED')) {
        setWorkflowError(
          new Error(
            `A workflow task has been rejected. Please check the logs for this task.`,
          ),
        );
      }

      const workflow = getWorkDefinitionBy('byName', response.workFlowName);
      if (workflow && allTasksRef.current.length === 0) {
        allTasksRef.current = getWorkflowTasksForTopology(workflow);
      }

      setWorkflowName(response.workFlowName);
      updateWorks(response.works);
      isLoading.current = false;
    },
    [
      executionId,
      fetch,
      getWorkDefinitionBy,
      setWorkflowError,
      setWorkflowStatus,
      updateWorks,
      workflowsUrl,
    ],
  );

  // setting delay to null stops useInterval
  const delay = workflowStatus === 'IN_PROGRESS' ? 5000 : null;

  useEffect(() => {
    updateWorksFromApi();
  }, [updateWorksFromApi]);

  useInterval(updateWorksFromApi, delay);

  useEffect(() => {
    return () => cleanUpWorkflow();
  }, [cleanUpWorkflow]);

  assert(!!workflowStatus, `workflowStatus is undefined`);

  return {
    tasks: allTasks,
    workflowStatus,
    workflowName,
  };
}
