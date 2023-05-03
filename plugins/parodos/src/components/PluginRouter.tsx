import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProjectOverviewPage } from './projectOverview';
import { Notification } from './notification';
import { Workflow } from './workflow/Workflow';
import { Onboarding } from './workflow/onboarding/Onboarding';
import { WorkFlowDetail } from './workflow/workflowDetail/WorkFlowDetail';
import { WorkflowsOverview } from './workflow/WorkflowsOverview';

export const PluginRouter = () => (
  <Routes>
    <Route path="/" element={<ProjectOverviewPage />} />
    <Route path="/project-overview" element={<ProjectOverviewPage />} />
    <Route path="/workflows" element={<WorkflowsOverview />} />
    <Route path="/workflows/new" element={<Workflow />} />
    <Route path="/notification" element={<Notification />} />
    <Route
      path="/onboarding/:projectId/:workflowName/new/"
      element={<Onboarding isNew />}
    />
    <Route
      path="/onboarding/:projectId/:executionId/workflow-detail"
      element={<WorkFlowDetail />}
    />
  </Routes>
);
