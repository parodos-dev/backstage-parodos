import {
  workflowDefinitionSchema,
  type ParameterFormat,
  type WorkflowDefinition,
} from '../../models/workflowDefinitionSchema';
import { FormSchema, Step } from '../../components/types';
import { jsonSchemaFromWorkflowDefinition } from './jsonSchemaFromWorkflowDefinition';
import { GetDefinitionFilter } from '../../stores/types';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { useImmerReducer } from 'use-immer';
import { useCallback, useEffect } from 'react';
import get from 'lodash.get';
import set from 'lodash.set';
import { assert } from 'assert-ts';
import { ValueProviderResponse } from '../../models/valueProviderResponse';

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

      for (const { key, value, options, propertyPath } of action.payload
        .valueProviderResponse) {
        const paths = propertyPath.split('.');
        const stepName = paths.length === 1 ? paths[0] : paths[1];

        const step =
          paths.length === 1
            ? draft.formSchema.steps[0]
            : Object.values(draft.formSchema.steps).find(
                s => !!get(s, `schema.properties.${stepName}`),
              );

        if (!step) {
          // eslint-disable-next-line no-console
          console.log(`no step found for ${`schema.properties.${stepName}`}`);
          continue;
        }

        let fieldPath = `schema.properties.${stepName}.properties.${key}`;

        let originalFormat = get(
          step,
          `uiSchema.${stepName}.${key}.['ui:original-format']`,
        ) as ParameterFormat;

        if (!get(step, fieldPath, undefined)) {
          const worksPath = `schema.properties.${stepName}.properties.works.items`;

          const works = get<Step, string>(step, worksPath) as Record<
            string,
            unknown
          >[];

          if (!works) {
            // eslint-disable-next-line no-console
            console.log(`no works at ${worksPath}`);
            continue;
          }

          const worksKey = paths.slice(-1)[0];

          const worksIndex = works.findIndex(work =>
            get(work, `properties.${worksKey}`),
          );

          assert(
            typeof worksIndex !== 'undefined',
            `no field found in works at ${fieldPath}`,
          );

          fieldPath = `${worksPath}[${worksIndex}].properties.${worksKey}.properties.${key}`;

          assert(!!get(step, fieldPath), `no field at ${fieldPath}`);

          originalFormat = get(
            step.uiSchema,
            `${stepName}.works.items[${worksIndex}].${worksKey}.${key}.['ui:original-format']`,
          );
        }

        if (options) {
          assert((options ?? []).length > 0, `no options at path ${stepName}`);

          const enumPath =
            originalFormat === 'multi-select' ? 'items.enum' : 'enum';

          set(step, `${fieldPath}.${enumPath}`, options);
        }

        set(
          step,
          `${fieldPath}.default`,
          originalFormat === 'multi-select' ? [value] : value,
        );
      }
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
