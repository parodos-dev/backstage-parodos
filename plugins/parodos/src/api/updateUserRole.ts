import { FetchApi } from '@backstage/core-plugin-api';
import { AccessRole } from '../models/project';
import * as urls from '../urls';

export async function updateUserRole(
  fetch: FetchApi['fetch'],
  baseUrl: string,
  projectId: string,
  payload: { username: string; roles: AccessRole[] }[],
) {
  const response = await fetch(
    `${baseUrl}${urls.Projects}/${projectId}/users`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  const data = await response.json();

  if ('error' in data) {
    throw new Error(`${data.error}: ${data.path}`);
  }
}
