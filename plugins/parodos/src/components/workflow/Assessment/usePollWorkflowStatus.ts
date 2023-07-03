import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import {
  WorkflowStatus,
  workflowStatusSchema,
  Status,
} from '../../../models/workflowTaskSchema';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { useState } from 'react';
import { useInterval } from '@patternfly/react-core';
import * as urls from '../../../urls';

interface PollWorkflowStatusOptions {
  executionId: string;
}

interface PollWorkflowStatusResult {
  status: Status;
  workflowError: unknown | undefined;
}

export function usePollWorkflowStatus({
  executionId,
}: PollWorkflowStatusOptions): PollWorkflowStatusResult {
  const [workflowError, setWorkflowError] = useState<unknown>();
  const [status, setStatus] = useState<Status>('IN_PROGRESS');
  const { fetch } = useApi(fetchApiRef);
  const workflowsUrl = useStore(state => state.getApiUrl(urls.Workflows));

  const delay = status === 'IN_PROGRESS' ? 1000 : null;

  useInterval(() => {
    async function tick() {
      const data = await fetch(`${workflowsUrl}/${executionId}/status`);
      const workflowStatus = workflowStatusSchema.parse(
        (await data.json()) as WorkflowStatus,
      );

      setStatus(workflowStatus.status);

      if (status === 'FAILED') {
        setWorkflowError(new Error(`workflow failed`));
        return;
      }

      if (status !== 'IN_PROGRESS') {
        return;
      }

      if (workflowStatus.works.some(w => w.status === 'REJECTED')) {
        setWorkflowError(
          new Error(
            `A workflow task has been rejected.  Please check the logs for this task.`,
          ),
        );
      }
    }

    tick();
  }, delay);

  return { status, workflowError };
}
