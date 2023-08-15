import { FetchApi } from '@backstage/core-plugin-api';
import { AccessStatus } from '../models/project';
import * as urls from '../urls';

export async function responseOnAccessRequest(
  fetch: FetchApi['fetch'],
  baseUrl: string,
  requestId: string,
  payload: { comment?: string; status: AccessStatus },
) {
  const response = await fetch(
    `${baseUrl}${urls.Projects}/access/${requestId}/status`,
    {
      method: 'POST',
      body: JSON.stringify({ ...payload, comment: payload.comment || '' }),
    },
  );
  if (response.status !== 204) {
    if (response.status === 400) {
      const data = await response.json();
      throw new Error(`${response.status}: ${data.message}`);
    }

    throw new Error(`${response.status}`);
  }
}
