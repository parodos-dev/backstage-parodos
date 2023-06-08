import { assert } from 'assert-ts';
import React, { ReactNode, useContext } from 'react';
import { createContext, useMemo, useState } from 'react';

type WorkFlowMode = 'RUNNING' | 'INPUT_REQUIRED';

export interface WorkFlowContext {
  workflowMode: WorkFlowMode;
  setWorkflowMode(mode: WorkFlowMode): void;
}

export const WorkflowContext = createContext<WorkFlowContext | undefined>(
  undefined,
);

export function WorkflowProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [workflowMode, setWorkflowMode] = useState<WorkFlowMode>('RUNNING');

  const value = useMemo(
    () => ({
      workflowMode,
      setWorkflowMode,
    }),
    [workflowMode],
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
