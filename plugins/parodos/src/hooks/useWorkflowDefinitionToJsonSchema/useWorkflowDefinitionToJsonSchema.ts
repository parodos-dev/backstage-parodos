import {
  workflowDefinitionSchema,
  type WorkflowDefinition,
} from '../../models/workflowDefinitionSchema';
import type { FormSchema } from '../../components/types';
import { jsonSchemaFromWorkflowDefinition } from './jsonSchemaFromWorkflowDefinition';
import { GetDefinitionFilter } from '../../stores/types';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { useImmerReducer } from 'use-immer';
import { useCallback, useEffect } from 'react';
import { mockDependantDefinition } from '../../mocks/workflowDefinitions/dependant';
import { ValueProviderResponse } from '../../models/valueProviderResponse';

type UPDATE_SCHEMA = {
  type: 'UPDATE_SCHEMA';
  payload: { valueProviderResponse: ValueProviderResponse };
};

type UpdateSchema = (
  action: UPDATE_SCHEMA['payload']['valueProviderResponse'],
) => UPDATE_SCHEMA;

type Actions =
  | {
      type: 'INITIALIZE';
      payload: { definition: WorkflowDefinition; updateSchema: UpdateSchema };
    }
  | UPDATE_SCHEMA;

type State = {
  formSchema: FormSchema;
  initialized: boolean;
  updateSchema?: (
    valueProviderResponse: ValueProviderResponse,
  ) => UPDATE_SCHEMA;
};

const reducer = (draft: State, action: Actions) => {
  switch (action.type) {
    case 'INITIALIZE': {
      if (!draft.initialized) {
        draft.formSchema = jsonSchemaFromWorkflowDefinition(
          mockDependantDefinition,
          draft.formSchema,
        );

        draft.updateSchema = action.payload.updateSchema;
        draft.initialized = true;
      }

      break;
    }
    case 'UPDATE_SCHEMA': {
      for (const { key, value, propertyPath } of action.payload
        .valueProviderResponse) {
        const step = !propertyPath ? draft.formSchema.steps[0] : undefined;

        if (!step) {
          continue;
        }

        const current = draft.formSchema.steps.find(s => s.title === key);

        console.log(current, value, key);

        if (!current) {
          continue;
        }
      }
      break;
    }
    default: {
      throw new Error('oh oh, we should not be here');
    }
  }
};

const initialState: State = {
  formSchema: { steps: [] },
  initialized: false,
};

export function useWorkflowDefinitionToJsonSchema(
  workflowDefinition: string,
  filterType: GetDefinitionFilter,
): State {
  const getWorkDefinitionBy = useStore(state => state.getWorkDefinitionBy);

  const [state, dispatch] = useImmerReducer(reducer, initialState);

  const updateSchema: UpdateSchema = useCallback(
    (valueProviderResponse: ValueProviderResponse) => ({
      type: 'UPDATE_SCHEMA',
      payload: { valueProviderResponse },
    }),
    [],
  );

  useEffect(() => {
    const definition = getWorkDefinitionBy(
      filterType,
      workflowDefinition,
    ) as WorkflowDefinition;

    dispatch({
      type: 'INITIALIZE',
      payload: {
        definition: workflowDefinitionSchema.parse(definition),
        updateSchema,
      },
    });
  }, [
    dispatch,
    filterType,
    getWorkDefinitionBy,
    updateSchema,
    workflowDefinition,
  ]);

  return state;
}
