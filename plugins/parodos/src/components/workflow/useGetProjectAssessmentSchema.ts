import { FormSchema } from '../types';
import { jsonSchemaFromWorkflowDefinition } from '../../hooks/useWorkflowDefinitionToJsonSchema/jsonSchemaFromWorkflowDefinition';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { assert } from 'assert-ts';

export function useGetProjectAssessmentSchema(): FormSchema {
  const assessment = useStore(state => state.workflows.assessment);
  const assessmentWorkflow = useStore(state =>
    state.getWorkDefinitionBy('byName', assessment),
  );

  assert(
    !!assessmentWorkflow,
    `no workflow definition found for ${assessment}`,
  );

  return jsonSchemaFromWorkflowDefinition(assessmentWorkflow, { steps: [] });
}
