import {
  WorkflowDefinition,
  WorkType,
} from '../models/workflowDefinitionSchema';
import { taskDisplayName } from '../utils/string';
import { WorkflowTask } from '../models/workflowTaskSchema';

export function getWorkflowTasksForTopology(
  workflowDefinition: WorkflowDefinition,
): WorkflowTask[] {
  const result: WorkflowTask[] = [];

  result.push({
    id: 'Project Information',
    status: 'COMPLETED',
    locked: false,
    label: 'Project Information',
    runAfterTasks: [],
  });

  if (workflowDefinition) addTasks(result, workflowDefinition, [result[0].id]);

  return result;
}

function addTasks(
  result: WorkflowTask[],
  work: WorkType | WorkflowDefinition,
  runAfterTasks: string[],
): string[] {
  let previousTasks: string[] = [];

  work.works?.forEach((subWork, index) => {
    if (subWork.workType === 'TASK') {
      result.push({
        id: subWork.name,
        status: 'PENDING',
        locked: false,
        label: taskDisplayName(subWork.name),
        runAfterTasks:
          work.processingType === 'PARALLEL' || index === 0
            ? runAfterTasks
            : previousTasks,
      });

      if (work.processingType === 'PARALLEL') {
        previousTasks = [...previousTasks, subWork.name];
      } else previousTasks = [subWork.name];
    } else {
      const tasks = addTasks(
        result,
        subWork,
        work.processingType === 'PARALLEL' || index === 0
          ? runAfterTasks
          : previousTasks,
      );
      previousTasks =
        work.processingType === 'PARALLEL'
          ? [...tasks, ...previousTasks]
          : tasks;
    }
  });
  return previousTasks;
}
