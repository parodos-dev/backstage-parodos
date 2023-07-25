import {
  type Work,
  type WorkflowDefinition,
} from '../models/workflowDefinitionSchema';
import { type WorkflowsPayload } from '../models/worksPayloadSchema';
import get from 'lodash.get';
import { type StrictRJSFSchema } from '@rjsf/utils';
import { assert } from 'assert-ts';

interface GetWorkflowsPayload {
  workflow: WorkflowDefinition;
  projectId: string;
  schema: StrictRJSFSchema;
}

type Works = WorkflowsPayload['works'];
type WorkPayload = WorkflowsPayload['works'][number];

export function walkWorks(
  works: Work[],
  // TODO: improve type
  formData: Record<string, any>,
  prefix: string = '',
): Works {
  const result: Works = [];
  for (const work of works) {
    const next: WorkPayload = {
      workName: work.name,
      type: work.workType,
      arguments: Object.keys(work.parameters ?? {}).map(key => {
        let path: string | undefined = undefined;

        if (prefix === '') {
          path = work.name;
        } else {
          const formDataWorks = get(
            formData,
            `${prefix}.works`,
            null,
          ) as Record<string, unknown>[];

          const index = formDataWorks.findIndex(w =>
            Object.keys(w).find(k => k === work.name),
          );

          assert(index !== -1, `no index found`);

          path = `${prefix}.works[${index}]${work.name}.${key}`;
        }

        const value = get(formData, path, null);

        return {
          key,
          value,
        };
      }),
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
