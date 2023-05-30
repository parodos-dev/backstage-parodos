import { FormSchema } from '../types';
import { jsonSchemaFromWorkflowDefinition } from '../../hooks/useWorkflowDefinitionToJsonSchema/jsonSchemaFromWorkflowDefinition';
import type {
  WorkflowDefinition,
  WorkFlowTaskParameter,
} from '../../models/workflowDefinitionSchema';
import { useStore } from '../../stores/workflowStore/workflowStore';
import set from 'lodash.set';
import { ParodosConfig } from '../../types';
import { assert } from 'assert-ts';

interface Props {
  hasProjects: boolean;
  newProject: boolean;
  workflows: Pick<ParodosConfig, 'workflows'>['workflows'];
}

const newProjectChoice: WorkFlowTaskParameter = {
  type: 'boolean',
  required: true,
  default: true,
};

export function useGetProjectAssessmentSchema({
  hasProjects,
  newProject,
  workflows: { assessment, assessmentTask },
}: Props): FormSchema {
  const definition = useStore(state =>
    state.getWorkDefinitionBy('byName', assessment),
  );

  assert(!!definition, `no workflow definition found for ${assessment}`);

  const cloned = JSON.parse(JSON.stringify(definition)) as WorkflowDefinition;

  cloned.works[0].parameters = cloned.works[0].parameters ?? {};

  if (newProject) {
    cloned.works[0].parameters.newProject = { ...newProjectChoice };

    // TODO: The Name and Description are temporarily hardcoded till https://issues.redhat.com/browse/FLPATH-233 is fixed
    cloned.works[0].parameters.name = {
      description: 'New Project',
      required: true,
      format: 'text',
      type: 'string',
    };
    cloned.works[0].parameters.description = {
      description: 'Description',
      required: false,
      format: 'text',
      type: 'string',
    };
    delete cloned.works[0].parameters.INPUT;
    // End of hardcoding
  } else {
    cloned.works[0].parameters = {};

    cloned.works[0].parameters.newProject = {
      ...newProjectChoice,
      description: 'Search for an existing project to execute a new workflow:',
    };

    cloned.works[0].parameters.project = {
      required: true,
      type: 'string',
      format: 'text',
      field: 'ProjectPicker',
      disabled: !hasProjects,
    };
  }

  const formSchema = jsonSchemaFromWorkflowDefinition(cloned, { steps: [] });

  set(formSchema, `steps[0].uiSchema.[${assessmentTask}].['ui:order']`, [
    'newProject',
    'name',
    'description',
    '*',
  ]);

  // TODO: should be able to do this with ui:title
  set(
    formSchema,
    `steps[0].schema.properties.[${assessmentTask}].properties.newProject.title`,
    'Is this a new assessment for this project?',
  );

  if (!hasProjects) {
    set(
      formSchema,
      `steps[0].uiSchema.[${assessmentTask}].newProject.['ui:disabled']`,
      true,
    );
  }

  set(
    formSchema,
    `steps[0].uiSchema.[${assessmentTask}].newProject.['ui:xs']`,
    12,
  );

  return formSchema;
}
