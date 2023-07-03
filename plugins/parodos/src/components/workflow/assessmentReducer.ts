import { Reducer } from 'react';
import type { WorkflowOptionsListItem } from './hooks/useCreateWorkflow';
import type { AssessmentStatusType } from './Workflow';

interface State {
  workflowOptions?: WorkflowOptionsListItem[];
  assessmentStatus: AssessmentStatusType;
  assessmentWorkflowExecutionId?: string;
  showMoreWorkflows: boolean;
}

type Actions =
  | {
      type: 'START';
    }
  | {
      type: 'COMPLETE';
      payload: Required<
        Pick<State, 'workflowOptions' | 'assessmentWorkflowExecutionId'>
      >;
    }
  | {
      type: 'TOGGLE_SHOW_WORKFLOWS';
    };

export const assessmentWorkflowInitialState: State = {
  workflowOptions: undefined,
  assessmentStatus: 'none',
  assessmentWorkflowExecutionId: undefined,
  showMoreWorkflows: true,
};

export const assessmentWorkflowReducer: Reducer<State, Actions> = (
  state,
  action,
) => {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        assessmentStatus: 'inprogress',
      };
    case 'COMPLETE':
      return {
        ...action.payload,
        assessmentStatus: 'complete',
        showMoreWorkflows: true,
      };
    case 'TOGGLE_SHOW_WORKFLOWS':
      return { ...state, showMoreWorkflows: !state.showMoreWorkflows };
    default: {
      throw new Error(`should not get here`);
    }
  }
};
