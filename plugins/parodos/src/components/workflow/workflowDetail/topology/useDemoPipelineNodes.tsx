import * as React from 'react';
import {
  DEFAULT_TASK_NODE_TYPE,
  PipelineNodeModel,
  RunStatus,
  WhenStatus,
} from '@patternfly/react-topology';
import '@patternfly/react-styles/css/components/Topology/topology-components.css';
import LockIcon from '@material-ui/icons/Lock';
import { WorkflowTask } from '../../../../models/workflowTaskSchema';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

export const NODE_PADDING_VERTICAL = 15;
export const NODE_PADDING_HORIZONTAL = 10;

export const DEFAULT_TASK_WIDTH = 300;
export const DEFAULT_TASK_HEIGHT = 32;

function getTaskIcon(task: WorkflowTask): JSX.Element | null {
  if (task.locked) {
    return <LockIcon color="error" />;
  }

  if (task.alertMessage) {
    return <OpenInNewIcon className="external-task" color="primary" />;
  }

  return null;
}

const WorkflowStatusRunStatusMap: Record<WorkflowTask['status'], RunStatus> = {
  ['COMPLETED']: RunStatus.Succeeded,
  ['IN_PROGRESS']: RunStatus.InProgress,
  ['FAILED']: RunStatus.Failed,
  ['REJECTED']: RunStatus.Failed,
  ['PENDING']: RunStatus.Pending,
};

const RunStatusWhenStatusMap = {
  [RunStatus.Succeeded]: WhenStatus.Met,
  [RunStatus.InProgress]: WhenStatus.InProgress,
};

export function useDemoPipelineNodes(
  workflowTasks: WorkflowTask[],
): PipelineNodeModel[] {
  const getConditionMet = (status: RunStatus) => {
    return (
      RunStatusWhenStatusMap[status as keyof typeof RunStatusWhenStatusMap] ??
      WhenStatus.Unmet
    );
  };

  const tasks = workflowTasks.map(workFlowTask => {
    const task: PipelineNodeModel = {
      id: workFlowTask.id,
      type: DEFAULT_TASK_NODE_TYPE,
      label: workFlowTask.label,
      width: DEFAULT_TASK_WIDTH,
      height: DEFAULT_TASK_HEIGHT,
      style: {
        padding: [NODE_PADDING_VERTICAL, NODE_PADDING_HORIZONTAL + 25],
      },
      runAfterTasks: workFlowTask.runAfterTasks,
    };

    task.data = {
      status: WorkflowStatusRunStatusMap[workFlowTask.status],
      taskIcon: getTaskIcon(workFlowTask),
    };

    return task;
  });

  const whenTasks = tasks.filter((_task, index) => index !== 0);

  for (const task of whenTasks) {
    task.data.whenStatus = getConditionMet(task.data.status);
  }

  return tasks;
}
