import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { FormControl } from '@material-ui/core';
import {
  Form,
  jsonSchemaFromWorkflowDefinition,
} from '@parodos/plugin-parodos';
import { FieldProps } from '@rjsf/core';
import { IChangeEvent } from '@rjsf/core-v5';
import React, { useMemo } from 'react';
import { useWorkflowDefinitions } from './useWorkflowDefinitions';

export function Assessment({
  onChange,
  rawErrors,
  required,
  formData,
}: FieldProps<Record<string, any>>) {
  const configApi = useApi(configApiRef);
  const definitions = useWorkflowDefinitions();
  const assessment = configApi.getString('parodos.workflows.assessment');

  const formSchema = useMemo(() => {
    const assessmentWorkflow = definitions?.find(
      definition => definition.name === assessment,
    );
    if (!assessmentWorkflow) return null;
    return jsonSchemaFromWorkflowDefinition(assessmentWorkflow, { steps: [] });
  }, [definitions, assessment]);

  const handleChange = ({
    formData: data,
  }: IChangeEvent<Record<string, any>>) => onChange(data);

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
