import { FetchApi } from '@backstage/core-plugin-api';
import { AccessRequest, accessRequests } from '../models/project';
import * as urls from '../urls';

export async function fetchAccessRequests(
  fetch: FetchApi['fetch'],
  baseUrl: string,
  filter?: { projectId?: string; username?: string },
): Promise<AccessRequest[]> {
  const response = await fetch(`${baseUrl}${urls.Projects}/access/pending`);
  const data = await response.json();

  if ('error' in data) {
    throw new Error(`${data.error}: ${data.path}`);
  }

  const requests = accessRequests.parse(data);

  return filter
    ? requests.filter(
        request =>
          (filter.projectId ? request.projectId === filter.projectId : true) &&
          (filter.username ? request.username === filter.username : true),
      )
    : requests;
}
