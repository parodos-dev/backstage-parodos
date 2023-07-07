import type { Step } from '../../components/types';
import get from 'lodash.get';
import { StrictRJSFSchema, UiSchema } from '@rjsf/utils';
import { assert } from 'assert-ts';

type Schema = NonNullable<StrictRJSFSchema['properties']>;

type Element = { schema: Schema; uiSchema: UiSchema };

function walkWorks(
  works: Schema[],
  currentUiSchema: UiSchema,
  currentKey: string,
  propertyPath: string,
  field: string,
): Element | undefined {
  for (const [index, work] of Object.entries(works)) {
    if (work.path === propertyPath) {
      const lastPath = propertyPath.split('.').slice(-1)[0];
      const uiSchema = get(
        currentUiSchema,
        `${currentKey}.works.items[${index}].${lastPath}.${field}`,
      );
      return {
        schema: get(
          work,
          `properties.${lastPath}.properties.${field}`,
        ) as Schema,
        uiSchema,
      };
    }

    if (!work.properties) {
      continue;
    }

    const element = walkProperties(
      work.properties as Schema,
      currentUiSchema,
      propertyPath,
      field,
    );

    if (element) {
      return element;
    }
  }

  return undefined;
}

function walkProperties(
  properties: Schema,
  currentUiSchema: UiSchema,
  propertyPath: string,
  field: string,
): Element | undefined {
  for (const [key, value] of Object.entries(properties) as any) {
    if (value?.properties?.works?.items) {
      const element = walkWorks(
        value.properties.works.items,
        currentUiSchema,
        key,
        propertyPath,
        field,
      );

      if (element) {
        return element;
      }
    }

    if (!value.properties) {
      continue;
    }

    const element = walkProperties(
      value.properties,
      get(currentUiSchema, key),
      propertyPath,
      field,
    );

    if (element) {
      return element;
    }
  }

  return undefined;
}

export function findStepFromPropertyPath(
  steps: Step[],
  propertyPath: string,
  field: string,
): Element | undefined {
  for (const step of steps) {
    if (step.path === propertyPath) {
      const schema = get(
        step,
        `schema.properties.${propertyPath}.properties.${field}`,
      );

      const uiSchema = get(step, `uiSchema.${propertyPath}.${field}`);

      assert(
        !!schema,
        `schema undefined undefined findStepFromPropertyPath for ${propertyPath}`,
      );

      return { schema, uiSchema };
    }

    if (!step.schema?.properties) {
      return undefined;
    }

    const element = walkProperties(
      step.schema.properties,
      step.uiSchema,
      propertyPath,
      field,
    );

    if (element) {
      return element;
    }
  }

  return undefined;
}
