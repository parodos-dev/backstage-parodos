import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { assert } from 'assert-ts';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { valueProviderResponseSchema } from '../models/valueProviderResponse';
import { useStore } from '../stores/workflowStore/workflowStore';
import * as urls from '../urls';
import type { UpdateSchema } from './useWorkflowDefinitionToJsonSchema/useWorkflowDefinitionToJsonSchema';

export interface UpdatePayload {
  key: string;
  value: string;
  workName: string;
}

interface UpdateSchemaProps {
  valueProviderName: string;
  workflowDefinitionName: string;
  updateSchema?: UpdateSchema;
}

export function useUpdateSchema({
  valueProviderName,
  workflowDefinitionName,
  updateSchema,
}: UpdateSchemaProps) {
  const { fetch } = useApi(fetchApiRef);
  const workflowDefinitionsUrl = useStore(store =>
    store.getApiUrl(urls.WorkflowDefinitions),
  );

  return useAsyncFn(
    async (payload: UpdatePayload[]) => {
      assert(!!updateSchema, 'no updateSchema function in formContext');

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

      const updates = valueProviderResponseSchema.parse(await data.json());

      if (updates.length === 0) {
        return;
      }

      updateSchema(updates);
    },
    [
      fetch,
      updateSchema,
      valueProviderName,
      workflowDefinitionName,
      workflowDefinitionsUrl,
    ],
  );
}
