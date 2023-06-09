import { assert } from 'assert-ts';
import React, { ReactNode, useContext } from 'react';
import { createContext, useMemo } from 'react';
import { useImmerReducer } from 'use-immer';
import { WorkflowTask } from '../../../models/workflowTaskSchema';

type WorkFlowMode = 'RUNNING' | 'EXTERNAL_INPUT_REQUIRED';

export interface WorkFlowContext {
  workflowMode: WorkFlowMode;
  setInputRequired(workflow: WorkflowTask): void;
  clearInputRequired(): void;
  workflowTask?: WorkflowTask;
}

export type WorkflowActions =
  | {
      type: 'EXTERNAL_INPUT_REQUIRED';
      payload: {
        workflow: WorkflowTask;
      };
    }
  | {
      type: 'CLEAR_INPUT';
    };

interface State {
  workflowMode: WorkFlowMode;
  externalInputWorkflowTask?: WorkflowTask;
}

const reducer = (draft: State, action: WorkflowActions) => {
  switch (action.type) {
    case 'EXTERNAL_INPUT_REQUIRED': {
      draft.externalInputWorkflowTask = action.payload.workflow;
      draft.workflowMode = 'EXTERNAL_INPUT_REQUIRED';
      break;
    }
    case 'CLEAR_INPUT': {
      draft.workflowMode = 'RUNNING';
      draft.externalInputWorkflowTask = undefined;
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
  externalInputWorkflowTask: undefined,
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
      setInputRequired: (workflow: WorkflowTask) =>
        dispatch({ type: 'EXTERNAL_INPUT_REQUIRED', payload: { workflow } }),
      clearInputRequired: () => dispatch({ type: 'CLEAR_INPUT' }),
      workflowTask: state.externalInputWorkflowTask,
    }),
    [dispatch, state.workflowMode, state.externalInputWorkflowTask],
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
