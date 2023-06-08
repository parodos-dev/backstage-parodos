import { Snackbar } from '@material-ui/core';
import React from 'react';
import { type WorkflowTask } from '../../../../models/workflowTaskSchema';

interface InputRequiredAlertProps {
  open?: boolean;
  workflowTask: WorkflowTask;
  handleClose: () => void;
}

export function InputRequiredAlert({
  open,
  handleClose,
  workflowTask,
}: InputRequiredAlertProps): JSX.Element {
  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      message={<div>Some notification message for {workflowTask.label}</div>}
    />
  );
}
