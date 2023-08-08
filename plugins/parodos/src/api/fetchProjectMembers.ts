import { FetchApi } from '@backstage/core-plugin-api';
import { projectMembers } from '../models/project';
import * as urls from '../urls';

export async function fetchProjectMembers(
  fetch: FetchApi['fetch'],
  baseUrl: string,
  projectId: string,
) {
  const response = await fetch(
    `${baseUrl}${urls.Projects}/${projectId}/members`,
  );
  const data = await response.json();

  if ('error' in data) {
    throw new Error(`${data.error}: ${data.path}`);
  }

  return projectMembers.parse(data);
}
