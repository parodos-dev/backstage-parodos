import { FetchApi } from '@backstage/core-plugin-api';
import { AccessRole } from '../models/project';
import * as urls from '../urls';

export async function responseOnAccessRequest(
  fetch: FetchApi['fetch'],
  baseUrl: string,
  requestId: string,
  payload: { comment?: string; status: AccessRole },
) {
  const response = await fetch(
    `${baseUrl}${urls.Projects}/access/${requestId}/status`,
    {
      method: 'POST',
      body: JSON.stringify({ ...payload, comment: payload.comment || '' }),
    },
  );
  const data = await response.json();

  if ('error' in data) {
    throw new Error(`${data.error}: ${data.path}`);
  }
}
