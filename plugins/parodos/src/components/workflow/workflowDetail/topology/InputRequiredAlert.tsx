import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import assert from 'assert-ts';
import React from 'react';
import { useWorkflowContext } from '../WorkflowContext';

interface InputRequiredAlertProps {
  open?: boolean;
  handleClose: () => void;
}

export function InputRequiredAlert({
  open,
  handleClose,
}: InputRequiredAlertProps): JSX.Element {
  const { workflowTask } = useWorkflowContext();

  assert(!!workflowTask, `no workflowTask in WorkflowContext`);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{
        vertical: 'center' as 'top',
        horizontal: 'left',
      }}
    >
      <Alert onClose={handleClose} severity="warning">
        Some notification message for {workflowTask?.label}
      </Alert>
    </Snackbar>
  );
}
