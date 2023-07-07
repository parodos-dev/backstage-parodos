import { reducer } from './useWorkflowDefinitionToJsonSchema';
import get from 'lodash.get';
import { WorkflowDefinition } from '../../models/workflowDefinitionSchema';
import { jsonSchemaFromWorkflowDefinition } from './jsonSchemaFromWorkflowDefinition';

type State = Parameters<typeof reducer>[0];
type Actions = Parameters<typeof reducer>[1];

const workflowDefinition: WorkflowDefinition = {
  id: 'ae9ebbb0-7418-42bb-91ca-1c1da0e430de',
  name: 'complexWorkFlow',
  type: 'INFRASTRUCTURE',
  processingType: 'SEQUENTIAL',
  author: null,
  createDate: '2023-07-07T07:06:59.130+00:00',
  modifyDate: '2023-07-07T07:06:59.130+00:00',
  parameters: {
    projectUrl: {
      format: 'uri',
      description: 'The project url',
      type: 'string',
      required: false,
    },
    WORKFLOW_SELECT_SAMPLE: {
      valueProviderName: 'complexWorkFlowValueProvider',
      format: 'select',
      description: 'Workflow select parameter sample',
      type: 'string',
      required: false,
      enum: ['option1', 'option2'],
    },
    WORKFLOW_MULTI_SELECT_SAMPLE: {
      format: 'multi-select',
      description: 'Workflow multi-select parameter sample',
      type: 'string',
      required: false,
    },
    workloadId: {
      format: 'text',
      description: 'The workload id',
      type: 'string',
      required: true,
    },
    DYNAMIC_TEXT_SAMPLE: {
      format: 'text',
      description: 'dynamic text sample',
      type: 'string',
      required: false,
    },
  },
  works: [],
};

const formSchema = jsonSchemaFromWorkflowDefinition(workflowDefinition, {
  steps: [],
});

const state: State = {
  formSchema,
  initialized: true,
};

const action: Actions = {
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
};

describe('reducer', () => {
  it('updates the schema with the valueProviderResponse', () => {
    const updateSchma = jest.fn();
    const enumPath =
      'formSchema.steps[0].schema.properties.complexWorkFlow.properties.WORKFLOW_MULTI_SELECT_SAMPLE.items.enum';

    // precondition
    expect(get(state, enumPath)).toHaveLength(0);

    reducer({ ...state, updateSchema: updateSchma }, action);

    expect(get(state, enumPath)).toHaveLength(3);
  });
});
