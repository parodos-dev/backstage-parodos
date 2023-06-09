import { makeStyles, Paper, Snackbar } from '@material-ui/core';
import assert from 'assert-ts';
import React from 'react';
import { useWorkflowContext } from '../WorkflowContext';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

interface InputRequiredAlertProps {
  open?: boolean;
  handleClose: () => void;
}

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: 'transparent',
    border: '2px solid transparent',
    borderRadius: theme.spacing(2),
  },
  message: {
    display: 'flex',
    padding: '6px 16px',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    fontWeight: 400,
    lineHeight: '1.43',
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.common.white,
  },
  icon: {
    marginLeft: theme.spacing(2),
    display: 'flex',
  },
}));

export function InputRequiredAlert({
  open,
}: InputRequiredAlertProps): JSX.Element {
  const { workflowTask } = useWorkflowContext();
  const styles = useStyles();

  assert(!!workflowTask, `no workflowTask in WorkflowContext`);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{
        vertical: 'center' as 'top',
        horizontal: 'left',
      }}
      className={styles.container}
    >
      <Paper elevation={4}>
        <div className={styles.message}>
          <div>
            Some notification message for {workflowTask?.label} and a link{' '}
          </div>
          <div className={styles.icon}>
            <OpenInNewIcon />
          </div>
        </div>
      </Paper>
    </Snackbar>
  );
}
