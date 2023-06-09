import React, { useCallback, type MouseEvent } from 'react';
import { type WorkflowTask } from '../../../../models/workflowTaskSchema';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { useWorkflowContext } from '../WorkflowContext';

interface InputRequiredProps {
  workflowTask: WorkflowTask;
}

export function InputRequired({
  workflowTask,
}: InputRequiredProps): JSX.Element {
  const { workflowMode, setInputRequired } = useWorkflowContext();

  const clickHandler = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // eslint-disable-next-line no-console
      console.log(workflowTask);
      if (workflowMode !== 'INPUT_REQUIRED') {
        setInputRequired(workflowTask);
      }
    },
    [setInputRequired, workflowMode, workflowTask],
  );

  return <OpenInNewIcon onClick={clickHandler} color="primary" />;
}
