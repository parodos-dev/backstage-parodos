import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { useStore } from '../stores/workflowStore/workflowStore';
import * as urls from '../urls';

export interface UpdatePayload {
  key: string;
  value: string;
  workName: string;
}

interface UpdateSchemaProps {
  valueProviderName: string;
  workflowDefinitionName: string;
}

export function useUpdateSchema({
  valueProviderName,
  workflowDefinitionName,
}: UpdateSchemaProps) {
  const { fetch } = useApi(fetchApiRef);
  const workflowDefinitionsUrl = useStore(store =>
    store.getApiUrl(urls.WorkflowDefinitions),
  );

  return useAsyncFn(
    async (payload: UpdatePayload[]) => {
      const data = await fetch(
        `${workflowDefinitionsUrl}/${workflowDefinitionName}/parameters/update/${valueProviderName}`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!data.ok) {
        throw new Error(`${data.status} - ${data.statusText}`);
      }

      return data;
    },
    [fetch, valueProviderName, workflowDefinitionName, workflowDefinitionsUrl],
  );
}
