import {
  workflowDefinitionSchema,
  type WorkflowDefinition,
} from '../../models/workflowDefinitionSchema';
import type { FormSchema, Step } from '../../components/types';
import { jsonSchemaFromWorkflowDefinition } from './jsonSchemaFromWorkflowDefinition';
import { GetDefinitionFilter } from '../../stores/types';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { useImmerReducer } from 'use-immer';
import { useCallback, useEffect } from 'react';
import set from 'lodash.set';
import { assert } from 'assert-ts';
import { ValueProviderResponse } from '../../models/valueProviderResponse';
import { findStepFromPropertyPath } from './helpers';
import get from 'lodash.get';

type UpdateSchema = {
  type: 'UPDATE_SCHEMA';
  payload: { valueProviderResponse: ValueProviderResponse };
};

export type UpdateSchemaAction = (
  action: UpdateSchema['payload']['valueProviderResponse'],
) => void;

type Actions =
  | {
      type: 'INITIALIZE';
      payload: {
        definition: WorkflowDefinition;
        updateSchema: UpdateSchemaAction;
      };
    }
  | UpdateSchema;

type State = {
  formSchema: FormSchema;
  initialized: boolean;
  updateSchema?: UpdateSchemaAction;
};

export function updateFormSchema(
  steps: Step[],
  valueProviderResponse: ValueProviderResponse,
) {
  for (const { key, value, options, propertyPath } of valueProviderResponse) {
    const paths = propertyPath.split('.');
    const stepName = paths.length === 1 ? paths[0] : paths[1];

    const elementToUpdate = findStepFromPropertyPath(steps, propertyPath, key);

    if (!elementToUpdate) {
      // eslint-disable-next-line no-console
      console.log(`no element found for ${propertyPath}`);
      continue;
    }

    const { schema, uiSchema } = elementToUpdate;

    assert(!!schema, `no schema at ${propertyPath}`);
    assert(!!uiSchema, `no uiSchema at ${propertyPath}`);

    const originalFormat = get(uiSchema, 'ui:original-format');

    if (options) {
      assert((options ?? []).length > 0, `no options at path ${stepName}`);

      const enumPath =
        originalFormat === 'multi-select' ? 'items.enum' : 'enum';

      set(schema, `${enumPath}`, options);
    }

    set(schema, `default`, originalFormat === 'multi-select' ? [value] : value);
  }
}

export const reducer = (draft: State, action: Actions) => {
  switch (action.type) {
    case 'INITIALIZE': {
      if (!draft.initialized) {
        draft.formSchema = jsonSchemaFromWorkflowDefinition(
          action.payload.definition,
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

      updateFormSchema(
        draft.formSchema.steps,
        action.payload.valueProviderResponse,
      );
      break;
    }
    default: {
      throw new Error(`unknown action type`);
    }
  }
};

export const initialState: State = {
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
    const definition = getWorkDefinitionBy(filterType, workflowDefinition);

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
