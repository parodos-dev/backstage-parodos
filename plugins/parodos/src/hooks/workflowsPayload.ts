import {
  WorkType,
  type WorkflowDefinition,
} from '../models/workflowDefinitionSchema';
import { type WorkflowsPayload } from '../models/worksPayloadSchema';
import get from 'lodash.get';
import { type StrictRJSFSchema } from '@rjsf/utils';

interface GetWorkflowsPayload {
  workflow: WorkflowDefinition;
  projectId: string;
  schema: StrictRJSFSchema;
}

type Works = WorkflowsPayload['works'];
type Work = WorkflowsPayload['works'][number];

export function walkWorks(
  works: WorkType[],
  // TODO: improve type
  formData: Record<string, any>,
  prefix: string = '',
): Works {
  const result: Works = [];
  for (const [index, work] of works.entries()) {
    const next: Work = {
      workName: work.name,
      type: work.workType,
      arguments: Object.keys(work.parameters ?? {})
        .map(key => {
          const value = get(
            formData,
            `${prefix === '' ? prefix : `${prefix}.works[${index}]`}${
              work.name
            }.${key}`,
            null,
          );

          if (work.parameters?.[key].required) {
            return {
              key,
              value,
            };
          }
          return undefined;
        })
        .filter(<T>(x: T | undefined): x is T => Boolean(x)),
    };

    if (work.workType === 'WORKFLOW' && work.works) {
      next.works = walkWorks(work.works, formData, `${work.name}`);
    }

    result.push(next);
  }

  return result;
}

export function getWorkflowsPayload({
  projectId,
  workflow,
  schema,
}: GetWorkflowsPayload): WorkflowsPayload {
  const payload: WorkflowsPayload = {
    projectId,
    workFlowName: workflow.name,

    arguments: Object.entries(workflow.parameters ?? {}).map(([key]) => {
      const value = get(schema, `${workflow.name}.${key}`, null);

      return {
        key,
        value,
      };
    }),
    works: walkWorks(workflow.works, schema),
  };

  return payload;
}
