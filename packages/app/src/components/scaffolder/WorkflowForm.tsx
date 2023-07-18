/* eslint-disable no-console */
import React, { useMemo } from 'react';
import { FormControl } from '@material-ui/core';
import { FieldProps } from '@rjsf/core';
import { IChangeEvent } from '@rjsf/core-v5';
import { useWorkflowDefinitions } from './useWorkflowDefinitions';
import {
  Form,
  jsonSchemaFromWorkflowDefinition,
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

  const formSchema = useMemo(() => {
    if (definitions === undefined) return null;
    const assessmentWorkflow = definitions?.find(
      definition => definition.name === workflowName,
    ) as WorkflowDefinition;
    return jsonSchemaFromWorkflowDefinition(assessmentWorkflow, { steps: [] });
  }, [definitions, workflowName]);

  return (
    <FormControl
      margin="normal"
      required={required}
      error={rawErrors?.length > 0 && !formData}
    >
      {formSchema && (
        <Form
          formSchema={formSchema}
          onChange={handleChange}
          stepLess
          hideTitle
        >
          <div />
        </Form>
      )}
    </FormControl>
  );
}
