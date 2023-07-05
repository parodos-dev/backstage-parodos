import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useEffect, useState } from 'react';
import { FirstTaskId } from '../../../hooks/getWorkflowDefinitions';
import { WorkflowTask } from '../../../models/workflowTaskSchema';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import * as urls from '../../../urls';

interface UpdateLogs {
  tasks: WorkflowTask[];
  selectedTaskId: string | null;
  executionId: string;
}

export function useUpdateLogs({
  tasks,
  selectedTaskId,
  executionId,
}: UpdateLogs) {
  const { fetch } = useApi(fetchApiRef);
  const [log, setLog] = useState<string>(``);
  const workflowsUrl = useStore(store => store.getApiUrl(urls.Workflows));

  useEffect(() => {
    const updateWorkFlowLogs = async () => {
      const selected = tasks.find(task => task.id === selectedTaskId);
      if (selectedTaskId === FirstTaskId) {
        setLog('Start workflow');
        return;
      }

      if (selected && selected?.status === 'PENDING') {
        setLog('Pending....');
        return;
      }

      if (selectedTaskId === '') {
        setLog('');
        return;
      }

      const data = await fetch(
        `${workflowsUrl}/${executionId}/log?taskName=${selectedTaskId}`,
      );
      const response = await data.text();
      setLog(
        `checking logs for ${selectedTaskId?.toUpperCase()} in execution: ${executionId}\n${response}`,
      );
    };
    const logInterval = setInterval(() => {
      updateWorkFlowLogs();
    }, 3000);
    updateWorkFlowLogs();

    return () => clearInterval(logInterval);
  }, [fetch, workflowsUrl, tasks, selectedTaskId, executionId]);

  return { log };
}
