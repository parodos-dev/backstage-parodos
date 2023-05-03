import React, { useCallback, useEffect } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { widgets } from './widgets';
import { useUpdateSchema } from '../../../hooks/useUpdateSchema';
import { assert } from 'assert-ts';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';

type ChangeEventHandlerArgs = Parameters<WidgetProps['onChange']>[0];

export function SelectWidget({
  disabled,
  onChange,
  formContext,
  ...props
}: WidgetProps) {
  const errorApi = useApi(errorApiRef);
  const valueProviderName = props.schema.valueProviderName;
  const workflowDefinitionName = Object.keys(
    props.registry.rootSchema.properties ?? {},
  )[0];
  const [{ loading, error }, updateSchema] = useUpdateSchema({
    valueProviderName,
    workflowDefinitionName,
    updateSchema: formContext.updateSchema,
  });

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

  useEffect(() => {
    if (error) {
      errorApi.post(new Error(`calling ${valueProviderName} failed`));
    }
  }, [error, errorApi, valueProviderName]);

  return (
    <widgets.SelectWidget
      disabled={loading || disabled}
      onChange={changeHandler}
      {...props}
      variant="outlined"
    />
  );
}
