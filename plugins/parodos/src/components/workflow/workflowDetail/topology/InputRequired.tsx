import React, { useCallback, type MouseEvent } from 'react';
import { type WorkflowTask } from '../../../../models/workflowTaskSchema';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

interface InputRequiredProps {
  workflowTask: WorkflowTask;
}

export function InputRequired({
  workflowTask,
}: InputRequiredProps): JSX.Element {
  const clickHandler = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return <OpenInNewIcon onClick={clickHandler} color="primary" />;
}
