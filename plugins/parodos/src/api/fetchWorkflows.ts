import { FetchApi } from '@backstage/core-plugin-api';
import { projectWorkflowsSchema } from '../models/workflowTaskSchema';
import * as urls from '../urls';

export async function fetchWorkflows(
  fetch: FetchApi['fetch'],
  baseUrl: string,
  projectId: string,
) {
  const data = await fetch(
    `${baseUrl}${urls.Workflows}?projectId=${projectId}`,
  );

  if (!data.ok) {
    throw new Error(`${data.status} - ${data.statusText}`);
  }

  const response = projectWorkflowsSchema.parse(await data.json());

  return response;
}
