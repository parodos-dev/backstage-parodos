import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { Step } from '../../types';

interface FormSchema {
  schema: RJSFSchema;
  uiSchema: UiSchema;
}

const newProjectFormSchema: FormSchema = {
  schema: {
    title: 'A registration form',
    description: 'A simple form example.',
    type: 'object',
    required: ['firstName', 'lastName'],
    properties: {
      name: {
        type: 'string',
        title: 'Project Name',
      },
      description: {
        type: 'string',
        title: 'Last name',
      },
    },
  },
  uiSchema: {
    name: {
      'ui:autofocus': true,
      'ui:emptyValue': undefined,
      'ui:help': 'New Project',
    },
    decription: {
      'ui:emptyValue': undefined,
      'ui:help': 'Description',
    },
  },
};

export const newProjectStep: Step = {
  ...newProjectFormSchema,
  mergedSchema: newProjectFormSchema.schema,
  title: 'New Project',
};
