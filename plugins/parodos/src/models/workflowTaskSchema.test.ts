import { assert } from 'assert-ts';
import { type SafeParseReturnType } from 'zod';
import {
  type WorkflowStatus,
  workflowStatusSchema,
} from './workflowTaskSchema';

const mockWorkflowStatus = {
  workFlowExecutionId: 'a6257c0a-c801-4449-827d-7a5d819ee733',
  workFlowName: 'ocpOnboardingWorkFlow',
  status: 'FAILED',
  works: [
    {
      name: 'workFlowA',
      type: 'WORKFLOW',
      status: 'FAILED',
      works: [
        {
          name: 'jiraTicketCreationWorkFlowTask',
          type: 'TASK',
          status: 'FAILED',
        },
        {
          name: 'notificationWorkFlowTask',
          type: 'TASK',
          status: 'PENDING',
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
};

describe('workflowTaskSchema', () => {
  it('parses API result', () => {
    const result: SafeParseReturnType<unknown, WorkflowStatus> =
      workflowStatusSchema.safeParse(mockWorkflowStatus);

    assert(result.success);

    expect(result.data.status).toBe('FAILED');
  });

  it('should ensure uppercase status', () => {
    const lowerCaseStatusWorkflow = {
      ...mockWorkflowStatus,
      works: mockWorkflowStatus.works.map(w => ({
        ...w,
        status: w.status.toLocaleLowerCase(),
      })),
    };

    // precondition
    expect(lowerCaseStatusWorkflow.works[0].status).toBe('failed');

    const result: SafeParseReturnType<unknown, WorkflowStatus> =
      workflowStatusSchema.safeParse(lowerCaseStatusWorkflow);

    assert(result.success);

    expect(result.data.status).toBe('FAILED');
  });
});