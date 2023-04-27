import {
  workflowDefinitionSchema,
  type WorkflowDefinition,
} from '../../models/workflowDefinitionSchema';
import type { FormSchema } from '../../components/types';
import { jsonSchemaFromWorkflowDefinition } from './jsonSchemaFromWorkflowDefinition';
import { GetDefinitionFilter } from '../../stores/types';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { useImmerReducer } from 'use-immer';
import { useEffect } from 'react';

type Actions = {
  type: 'INITIALIZE';
  payload: { definition: WorkflowDefinition };
};

type State = { formSchema: FormSchema };

const reducer = (draft: State, action: Actions) => {
  // eslint-disable-next-line default-case
  switch (action.type) {
    case 'INITIALIZE': {
      draft.formSchema = jsonSchemaFromWorkflowDefinition(
        action.payload.definition,
        draft.formSchema,
      );
      break;
    }
  }
};

const initialState = {
  formSchema: { steps: [] },
};

export function useWorkflowDefinitionToJsonSchema(
  workflowDefinition: string,
  filterType: GetDefinitionFilter,
): FormSchema {
  const getWorkDefinitionBy = useStore(state => state.getWorkDefinitionBy);

  const [state, dispatch] = useImmerReducer(reducer, initialState);

  useEffect(() => {
    const definition = getWorkDefinitionBy(
      filterType,
      workflowDefinition,
    ) as WorkflowDefinition;

    dispatch({
      type: 'INITIALIZE',
      payload: { definition: workflowDefinitionSchema.parse(definition) },
    });
  }, [dispatch, filterType, getWorkDefinitionBy, workflowDefinition]);

  return state.formSchema;
}
