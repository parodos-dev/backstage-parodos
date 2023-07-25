import { FetchApi } from '@backstage/core-plugin-api';
import { workflowExecute } from '../models/workflow';
import { WorkflowsPayload } from '../models/worksPayloadSchema';
import * as urls from '../urls';

export async function executeWorkflow(
  fetch: FetchApi['fetch'],
  baseUrl: string,
  payload: WorkflowsPayload,
) {
  // TODO:  task here should be dynamic based on assessment workflow definition
  const workFlowResponse = await fetch(`${baseUrl}${urls.Workflows}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!workFlowResponse.ok) {
    throw new Error(
      `${workFlowResponse.status} - ${workFlowResponse.statusText}`,
    );
  }

  return workflowExecute.parse(await workFlowResponse.json());
}
