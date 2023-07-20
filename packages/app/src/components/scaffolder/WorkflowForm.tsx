/* eslint-disable no-console */
import React, { useCallback, useEffect, useMemo } from 'react';
import { FormControl } from '@material-ui/core';
import { FieldProps } from '@rjsf/core';
import { IChangeEvent } from '@rjsf/core-v5';
import { useImmer } from 'use-immer';
import { useWorkflowDefinitions } from './useWorkflowDefinitions';
import {
  Form,
  jsonSchemaFromWorkflowDefinition,
  updateFormSchema,
  ValueProviderResponse,
  WorkflowDefinition,
} from '@parodos/plugin-parodos';

export function WorkflowForm({
  onChange,
  rawErrors,
  required,
  formData,
  formContext,
}: FieldProps<string>): JSX.Element {
  const { options } = formContext.formData;
  const { workflowName } = options ?? {};

  const definitions = useWorkflowDefinitions();

  const handleChange = ({
    formData: data,
  }: IChangeEvent<Record<string, any>>) => onChange(data);

  const jsonSchema = useMemo(() => {
    if (definitions === undefined) return null;
    const assessmentWorkflow = definitions?.find(
      definition => definition.name === workflowName,
    ) as WorkflowDefinition;
    return jsonSchemaFromWorkflowDefinition(assessmentWorkflow, {
      steps: [],
    });
  }, [definitions, workflowName]);

  const [formSchema, updateSchema] = useImmer(jsonSchema);

  const handleUpdateSchema = useCallback(
    (valueProviderResponse: ValueProviderResponse) => {
      updateSchema(draft => {
        if (draft?.steps) updateFormSchema(draft?.steps, valueProviderResponse);
      });
    },
    [updateSchema],
  );

  useEffect(() => {
    if (jsonSchema) {
      updateSchema(jsonSchema);
    }
  }, [jsonSchema, updateSchema]);

  return (
    <FormControl
      margin="normal"
      required={required}
      error={rawErrors?.length > 0 && !formData}
    >
      {formSchema && (
        <Form
          formSchema={formSchema}
          updateSchema={handleUpdateSchema}
          onChange={handleChange}
        >
          <div />
        </Form>
      )}
    </FormControl>
  );
}
