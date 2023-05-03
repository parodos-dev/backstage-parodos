import {
  workflowDefinitionSchema,
  type ParameterFormat,
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
import get from 'lodash.get';
import set from 'lodash.set';
import { current } from 'immer';

type UPDATE_SCHEMA = {
  type: 'UPDATE_SCHEMA';
  payload: { valueProviderResponse: ValueProviderResponse };
};

export type UpdateSchema = (
  action: UPDATE_SCHEMA['payload']['valueProviderResponse'],
) => void;

type Actions =
  | {
      type: 'INITIALIZE';
      payload: { definition: WorkflowDefinition; updateSchema: UpdateSchema };
    }
  | UPDATE_SCHEMA;

type State = {
  formSchema: FormSchema;
  initialized: boolean;
  updateSchema?: UpdateSchema;
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
      if (action.payload.valueProviderResponse.length === 0) {
        return;
      }

      for (const { key, value, options, propertyPath } of action.payload
        .valueProviderResponse) {
        const paths = propertyPath.split('.');
        if(paths.length === 1) {
          const step = draft.formSchema.steps[0];

          const workName = paths[0];

          const fieldPath = `schema.properties.${workName}.properties.${key}`;

          const originalFormat = get(step, `uiSchema.${workName}.${key}.['ui:original-format']`) as ParameterFormat;

          if(options) {
            set(step, `${fieldPath}.items.enum`, options ?? []);
          }

          set(step, `${fieldPath}.default`, originalFormat === 'multi-select' ? [value] : value);

          continue;
        }

        // const step = paths.length === 1 ? draft.formSchema.steps[0] : draft.formSchema.steps[paths.length - 2];

        // const field = paths.length === 1 ? get(step, `schema.properties.${paths[0]}.properties.${key}`) : undefined;

        // console.log({paths, step: current(step), field})
       
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

  const updateSchema = useCallback(
    (valueProviderResponse: ValueProviderResponse) =>
      dispatch({
        type: 'UPDATE_SCHEMA',
        payload: { valueProviderResponse },
      }),
    [dispatch],
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
