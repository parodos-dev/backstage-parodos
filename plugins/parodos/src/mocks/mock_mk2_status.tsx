import type { WorkflowStatus } from '../models/workflowTaskSchema';

export const M2k: WorkflowStatus = {
  workFlowExecutionId: '41dea097-8eeb-4a9b-b4db-05668797a7cd',
  workFlowName: 'ocpOnboardingWorkFlow',
  works: [
    {
      name: 'workFlowA',
      type: 'WORKFLOW',
      status: 'COMPLETED',
      works: [
        {
          name: 'jiraTicketCreationWorkFlowTask',
          type: 'TASK',
          status: 'PENDING',
          alertMessage: '[link](http://localhost:8080)',
        },
        {
          name: 'jiraTicketEmailNotificationWorkFlowTask',
          type: 'TASK',
          status: 'PENDING',
        },
      ],
    },
    {
      name: 'workFlowB',
      type: 'WORKFLOW',
      status: 'PENDING',
    },
  ],
  status: 'IN_PROGRESS',
};
