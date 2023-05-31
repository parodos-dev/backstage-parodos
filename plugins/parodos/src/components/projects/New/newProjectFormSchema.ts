import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { Step } from '../../types';

interface FormSchema {
  schema: RJSFSchema;
  uiSchema: UiSchema;
}

const newProjectFormSchema: FormSchema = {
  schema: {
    title: 'New project form',
    type: 'object',
    required: ['name', 'description'],
    properties: {
      name: {
        type: 'string',
        title: 'Project Name',
      },
      description: {
        type: 'string',
        title: 'Description',
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
