import { Config } from '@backstage/config';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import type {
  WorkflowDefinition,
  Work,
  WorkflowsPayload,
} from '@parodos/plugin-parodos';
import get from 'lodash.get';
import { type StrictRJSFSchema } from '@rjsf/utils';
import { z } from 'zod';

export const executeWorkflow = (options: { config: Config }) => {
  const { config } = options;

  return createTemplateAction({
    id: 'parodos:workflow:execute',
    schema: {
      input: z.object({
        workflowName: z.string(),
        projectId: z.string(),
        assessmentId: z.string(),
        formData: z.record(z.any()),
      }),
    },

    async handler(ctx) {
      const baseUrl = config.getString('backend.baseUrl');
      const { workflowName, assessmentId, projectId, formData } = ctx.input;
      const response = await fetch(
        `${baseUrl}/api/proxy/parodos/workflowdefinitions`,
      );
      const definitions = await (response.json() as Promise<
        WorkflowDefinition[]
      >);
      const workflowDefinition = definitions.find(
        definition => definition.name === workflowName,
      ) as WorkflowDefinition;
      const payload = {
        ...getWorkflowsPayload({
          projectId,
          workflow: workflowDefinition,
          schema: formData,
        }),
        invokingExecutionId:
          workflowDefinition.type !== 'ASSESSMENT' ? assessmentId : null,
      };

      const workFlowResponse = await fetch(
        `${baseUrl}/api/proxy/parodos/workflows`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      if (!workFlowResponse.ok) {
        throw new Error(
          `${workFlowResponse.status} - ${workFlowResponse.statusText}`,
        );
      }
    },
  });
};

interface GetWorkflowsPayload {
  workflow: WorkflowDefinition;
  projectId: string;
  schema: StrictRJSFSchema;
}

type Works = WorkflowsPayload['works'];
type WorkPayload = WorkflowsPayload['works'][number];

export function walkWorks(
  works: Work[],
  formData: Record<string, any>,
  prefix: string = '',
): Works {
  const result: Works = [];
  for (const [index, work] of works.entries()) {
    const next: WorkPayload = {
      workName: work.name,
      type: work.workType,
      arguments: Object.keys(work.parameters ?? {}).map(key => {
        const value = get(
          formData,
          `${prefix === '' ? prefix : `${prefix}.works[${index}]`}${
            work.name
          }.${key}`,
          null,
        );

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
