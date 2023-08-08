import { FetchApi } from '@backstage/core-plugin-api';
import { AccessRole } from '../models/project';
import * as urls from '../urls';

// TODO There has been no API for this yet
export async function fetchAccessRequests(
  fetch: FetchApi['fetch'],
  baseUrl: string,
  projectId: string,
): Promise<{ username: string; requestId: string; role: AccessRole }[]> {
  const response = await fetch(
    `${baseUrl}${urls.Projects}/${projectId}/access`,
  );
  const data = await response.json();

  if ('error' in data) {
    throw new Error(`${data.error}: ${data.path}`);
  }

  return data;
}
