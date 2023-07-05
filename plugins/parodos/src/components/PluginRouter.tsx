import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Notification } from './notification';
import { Workflow } from './workflow/Workflow';
import { Onboarding } from './workflow/onboarding/Onboarding';
import { WorkFlowDetail } from './workflow/workflowDetail/WorkFlowDetail';
import { WorkflowsOverview } from './workflow/WorkflowsOverview';
import { ProjectsOverview } from './projects/ProjectsOverview';
import { ProjectsNew } from './projects/New/ProjectsNew';
import { ProjectAccessManager } from './projects/ProjectAccessManager';
import { AssessmentWorkflow } from './workflow/Assessment/AssessmentWorkflow';
import { AssessmentWorkflowExecution } from './workflow/Assessment/AssessmentWorkflowExecution';

export const PluginRouter = () => (
  <Routes>
    <Route path="/" element={<ProjectsOverview />} />
    <Route path="/projects" element={<ProjectsOverview />} />
    <Route path="/projects/new" element={<ProjectsNew />} />
    <Route
      path="/projects/:projectId/access"
      element={<ProjectAccessManager />}
    />
    <Route path="/workflows" element={<WorkflowsOverview />} />
    <Route
      path="/workflows/assessment/:projectId/:assessmentWorkflowExecutionId"
      element={<AssessmentWorkflow />}
    />
    <Route
      path="/workflows/assessment/:projectId/:assessmentWorkflowExecutionId/execution"
      element={<AssessmentWorkflowExecution />}
    />
    <Route path="/onboarding" element={<Workflow />} />
    <Route path="/notification" element={<Notification />} />
    <Route
      path="/onboarding/:projectId/:workflowName/:assessmentWorkflowExecutionId/new/"
      element={<Onboarding isNew />}
    />
    <Route
      path="/onboarding/:projectId/:executionId/workflow-detail"
      element={<WorkFlowDetail />}
    />
  </Routes>
);
