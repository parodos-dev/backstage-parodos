import { assert } from 'assert-ts';
import React, { ReactNode, useContext } from 'react';
import { createContext, useMemo } from 'react';
import { useImmerReducer } from 'use-immer';
import { WorkflowTask } from '../../../models/workflowTaskSchema';

type WorkFlowMode = 'RUNNING' | 'TASK_ALERT';

export interface WorkFlowContext {
  workflowMode: WorkFlowMode;
  showAlert(workflow: WorkflowTask): void;
  clearAlert(): void;
}

export type WorkflowActions =
  | {
      type: 'TASK_ALERT';
    }
  | {
      type: 'CLEAR_ALERT';
    };

interface State {
  workflowMode: WorkFlowMode;
}

const reducer = (draft: State, action: WorkflowActions) => {
  switch (action.type) {
    case 'TASK_ALERT': {
      draft.workflowMode = 'TASK_ALERT';
      break;
    }
    case 'CLEAR_ALERT': {
      draft.workflowMode = 'RUNNING';
      break;
    }
    default:
      throw new Error(`no action`);
  }
};

export const WorkflowContext = createContext<WorkFlowContext | undefined>(
  undefined,
);

const initialState: State = {
  workflowMode: 'RUNNING',
};

export function WorkflowProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [state, dispatch] = useImmerReducer(reducer, initialState);

  const value = useMemo(
    () => ({
      workflowMode: state.workflowMode,
      showAlert: () => dispatch({ type: 'TASK_ALERT' }),
      clearAlert: () => dispatch({ type: 'CLEAR_ALERT' }),
    }),
    [dispatch, state.workflowMode],
  );

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflowContext() {
  const context = useContext(WorkflowContext);

  assert(!!context, 'useWorkflowProvider must be within WorkflowProvider');

  return context;
}
