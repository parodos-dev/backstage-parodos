import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { createScaffolderFieldExtension } from '@backstage/plugin-scaffolder-react';
import { ProjectSelect } from './ProjectSelect';
import { Assessment } from './Assessment';
import { WorkflowOptions } from './WorkflowOptions';
import { WorkflowForm } from './WorkflowForm';

// TODO Validate inputs

export const WorkflowOptionsExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'WorkflowOptions',
    component: WorkflowOptions,
  }),
);

export const ProjectSelectExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'ProjectSelect',
    component: ProjectSelect,
  }),
);

export const AssessmentExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'Assessment',
    component: Assessment,
  }),
);

export const WorkflowFormExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'WorkflowForm',
    component: WorkflowForm,
  }),
);
