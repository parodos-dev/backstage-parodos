import { FetchApi } from '@backstage/core-plugin-api';
import * as urls from '../urls';

export async function removeUserFromProject(
  fetch: FetchApi['fetch'],
  baseUrl: string,
  projectId: string,
  users: string[],
) {
  const response = await fetch(
    `${baseUrl}${urls.Projects}/${projectId}/users`,
    {
      method: 'DELETE',
      body: JSON.stringify(users),
    },
  );
  const data = await response.json();

  if ('error' in data) {
    throw new Error(`${data.error}: ${data.path}`);
  }
}
