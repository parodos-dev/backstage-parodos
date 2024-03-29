import {
  type ParameterFormat,
  type WorkflowDefinition,
  type Work,
} from '../../models/workflowDefinitionSchema';
import type { FormSchema, Step } from '../../components/types';
import set from 'lodash.set';
import get from 'lodash.get';
import { taskDisplayName } from '../../utils/string';
import type { StrictRJSFSchema, UiSchema } from '@rjsf/utils';
import { assert } from 'assert-ts';

export const UriPattern =
  '^(https:\\/\\/www.|https:\\/\\/|git@|ssh:\\/\\/[a-z]+@)?[a-zA-Z0-9]+([-.]{1}[a-zA-Z0-9]+)*\\.[:a-zA-Z-0-9]+(:[0-9]{1,5})?(/.*)?$';

export function getJsonSchemaType(
  type: ParameterFormat,
  options: string[] = [],
) {
  switch (type) {
    case 'password':
    case 'text':
      return {
        type: 'string',
      };
    case 'number':
      return {
        type: 'number',
      };
    case 'date':
      return {
        type: 'string',
        format: 'date',
      };
    case 'email':
      return {
        type: 'string',
        format: 'email',
      };
    case 'uri':
      return {
        type: 'string',
        pattern: UriPattern,
      };
    case 'boolean': {
      return {
        type: 'boolean',
      };
    }
    case 'select': {
      return {
        type: 'string',
        enum: options,
      };
    }
    case 'multi-select': {
      return {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'string',
          enum: options,
        },
      };
    }
    default:
      return {
        type: 'string',
      };
  }
}

export function getUiSchema(type: ParameterFormat) {
  switch (type) {
    case 'password':
      return {
        'ui:emptyValue': undefined,
        'ui:widget': 'password',
      };
    case 'text':
      return {
        'ui:emptyValue': undefined,
      };
    case 'email':
      return {
        'ui:widget': 'email',
      };
    case 'boolean': {
      return {
        // TODO: what if needs to be a checkbox list?
        'ui:widget': 'radio',
      };
    }
    case 'multi-select':
      return {
        'ui:widget': 'checkboxes',
      };
    case 'uri':
    case 'number':
      return {};
    default:
      return {};
  }
}

function* transformWorkToStep(work: Work, path: string) {
  const title = taskDisplayName(work.name); // TODO: task label would be good here

  const childWorks = (work.works ?? []).filter(worksWithParameter);

  const workHasUiElements =
    Object.keys(work.parameters ?? {}).length > 0 ||
    childWorks.filter(w => w.workType === 'TASK').length > 0;

  if (!workHasUiElements) {
    for (const childWork of childWorks) {
      let childStep: Step;
      for (childStep of transformWorkToStep(
        childWork,
        `${path}.${childWork.name}`,
      )) {
        yield childStep;
      }
    }

    return;
  }

  const schema: StrictRJSFSchema = {
    type: 'object',
    title,
    properties: {},
    required: [],
  };

  const uiSchema: UiSchema = {};

  schema.required?.push(work.name);

  set(schema, `properties.${work.name}`, {
    type: 'object',
    properties: {},
    required: [],
  });

  uiSchema[work.name] = {
    'ui:hidden': true,
  };

  for (const [
    key,
    {
      description,
      type,
      required,
      format,
      default: fieldDefault,
      field,
      minLength,
      maxLength,
      enum: options,
      valueProviderName,
    },
  ] of Object.entries(work.parameters ?? {})) {
    const propertiesPath = `properties.${work.name}.properties.${key}`;

    set(schema, propertiesPath, {
      title: `${key}`,
      ...getJsonSchemaType(format ?? (type as ParameterFormat), options),
      ...{ default: fieldDefault },
      minLength,
      maxLength,
    });

    if (typeof valueProviderName === 'string') {
      set(schema, `${propertiesPath}.valueProviderName`, valueProviderName);
    }

    const objectPath = `${work.name}.${key}`;

    set(uiSchema, objectPath, {
      ...getUiSchema(format ?? (type as ParameterFormat)),
      'ui:field': field,
      'ui:help': description,
      'ui:original-format': format,
    });

    if (required) {
      const requiredPath = `properties.${work.name}.required`;
      const taskRequired = get(schema, requiredPath);
      taskRequired.push(key);
    }
  }

  if (childWorks.length > 0) {
    assert(!!schema.properties);

    const key = Object.keys(schema.properties)[0];

    set(schema, `properties.${key}.properties.works`, {
      type: 'array',
      title: `${title} works`,
      items: [],
    });

    set(uiSchema, `${key}.works.items`, []);

    for (const [index, childWork] of childWorks.entries()) {
      let childStep: Step;
      for (childStep of transformWorkToStep(
        childWork,
        `${path}.${childWork.name}`,
      )) {
        // We don't want to nest the recusive structure many levels deep
        // so instead we flatten the structure and only allow one level of nesting
        if (childWork.workType === 'WORKFLOW') {
          yield childStep;
          continue;
        }

        const nextSchemaKey = `properties.${key}.properties.works.items[${index}]`;
        const nextUiSchemaKey = `${key}.works.items[${index}]`;
        const nextSchemaPath = `${nextSchemaKey}.path`;

        set(schema, nextSchemaKey, childStep.schema);
        set(schema, nextSchemaPath, `${path}.${childWork.name}`);

        set(uiSchema, `${key}.works.['ui:hidden']`, true);
        set(uiSchema, nextUiSchemaKey, childStep.uiSchema);
      }
    }
  }

  yield {
    schema,
    uiSchema,
    title,
    mergedSchema: schema,
    parent: undefined,
    path,
  };
}

export function* getAllSteps(work: Work, path: string) {
  yield* transformWorkToStep(work, path);
}

export function jsonSchemaFromWorkflowDefinition(
  workflowDefinition: WorkflowDefinition,
  formSchema: FormSchema,
): FormSchema {
  const parameters = workflowDefinition.parameters ?? {};

  if (Object.keys(parameters).length > 0) {
    const masterStep = [
      ...transformWorkToStep(
        {
          name: workflowDefinition.name,
          parameters,
        } as Work,
        workflowDefinition.name,
      ),
    ][0];

    formSchema.steps.push(masterStep);
  }

  const uiWorks = workflowDefinition.works.filter(
    w =>
      worksWithParameter(w) &&
      (Object.keys(w.parameters ?? {}).length > 0 ||
        (w?.works ?? []).length > 0),
  );

  for (const work of uiWorks) {
    for (const step of [
      ...getAllSteps(work, `${workflowDefinition.name}.${work.name}`),
    ].reverse()) {
      formSchema.steps.push(step);
    }
  }

  return formSchema;
}

function worksWithParameter(work: Work): boolean {
  if ((work.works ?? []).length === 0) {
    return Object.keys(work.parameters ?? {}).length > 0;
  }

  for (const subWork of work.works ?? []) {
    if (worksWithParameter(subWork)) {
      return true;
    }
  }

  return false;
}
