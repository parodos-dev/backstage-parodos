import { reducer } from './useWorkflowDefinitionToJsonSchema';
import get from 'lodash.get';

type State = Parameters<typeof reducer>[0];
type Actions = Parameters<typeof reducer>[1];

const state = {
  formSchema: {
    steps: [
      {
        schema: {
          type: 'object',
          title: 'Complex Work Flow',
          properties: {
            complexWorkFlow: {
              type: 'object',
              properties: {
                WORKFLOW_SELECT_SAMPLE: {
                  title: 'WORKFLOW_SELECT_SAMPLE',
                  type: 'string',
                  enum: ['option1', 'option2'],
                  valueProviderName: 'complexWorkFlowValueProvider',
                },
                WORKFLOW_MULTI_SELECT_SAMPLE: {
                  title: 'WORKFLOW_MULTI_SELECT_SAMPLE',
                  type: 'array',
                  uniqueItems: true,
                  items: {
                    type: 'string',
                    enum: [],
                  },
                },
              },
            },
          },
          required: ['complexWorkFlow'],
        },
        uiSchema: {
          complexWorkFlow: {
            'ui:hidden': true,
            WORKFLOW_SELECT_SAMPLE: {
              'ui:help': 'Workflow select parameter sample',
              'ui:original-format': 'select',
            },
            WORKFLOW_MULTI_SELECT_SAMPLE: {
              'ui:widget': 'checkboxes',
              'ui:help': 'Workflow multi-select parameter sample',
              'ui:original-format': 'multi-select',
            },
          },
        },
        title: 'Complex Work Flow',
      },
    ],
  },
  initialized: true,
} as unknown as State;

const action = {
  type: 'UPDATE_SCHEMA',
  payload: {
    valueProviderResponse: [
      {
        key: 'WORKFLOW_MULTI_SELECT_SAMPLE',
        options: ['option5', 'option4', 'option3'],
        value: 'option5',
        propertyPath: 'complexWorkFlow',
      },
    ],
  },
} as Actions;

describe('reducer', () => {
  it('updates the schema with the valueProviderRespose', () => {
    const updateSchma = jest.fn();
    const enumPath =
      'formSchema.steps[0].schema.properties.complexWorkFlow.properties.WORKFLOW_MULTI_SELECT_SAMPLE.items.enum';

    // precondition
    expect(get(state, enumPath)).toHaveLength(0);

    reducer({ ...state, updateSchema: updateSchma }, action);

    expect(get(state, enumPath)).toHaveLength(3);
  });
});
