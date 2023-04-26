import React, { useCallback } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { widgets } from './widgets';
import { useUpdateSchema } from '../../../hooks/useUpdateSchema';
import { assert } from 'assert-ts';

type ChangeEventHandlerArgs = Parameters<WidgetProps['onChange']>[0];

export function SelectWidget({ onChange, ...props }: WidgetProps) {
  const valueProviderName = props.schema.valueProviderName;
  const workflowDefinitionName = Object.keys(
    props.registry.rootSchema.properties ?? {},
  )[0];
  const [{ loading, error }, updateSchema] = useUpdateSchema({
    valueProviderName,
    workflowDefinitionName,
  });

  // eslint-disable-next-line no-console
  console.log({ loading, error, schema: props.schema });

  const changeHandler = useCallback(
    async (value: ChangeEventHandlerArgs) => {
      if (valueProviderName) {
        assert(!!props.schema.title);

        updateSchema([
          {
            key: props.schema.title,
            value,
            workName: workflowDefinitionName,
          },
        ]);
      }

      onChange(value);
    },
    [
      onChange,
      props.schema.title,
      updateSchema,
      valueProviderName,
      workflowDefinitionName,
    ],
  );

  return (
    <widgets.SelectWidget
      onChange={changeHandler}
      {...props}
      variant="outlined"
    />
  );
}
