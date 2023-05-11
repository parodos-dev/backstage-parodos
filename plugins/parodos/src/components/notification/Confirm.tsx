import React, { type ReactNode, MouseEventHandler } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Button } from '@material-ui/core';

interface ConfirmProps {
  title?: ReactNode;
  content: ReactNode;
  open: boolean;
  yesHandler: MouseEventHandler<HTMLButtonElement>;
  noHandler: MouseEventHandler<HTMLButtonElement>;
  closeHandler: MouseEventHandler<HTMLButtonElement>;
}

export function Confirm({
  title,
  content,
  open,
  closeHandler,
  yesHandler,
  noHandler,
}: ConfirmProps): JSX.Element {
  return (
    <Dialog
      open={open}
      onClose={closeHandler}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={noHandler} color="primary">
          No
        </Button>
        <Button onClick={yesHandler} color="primary">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
