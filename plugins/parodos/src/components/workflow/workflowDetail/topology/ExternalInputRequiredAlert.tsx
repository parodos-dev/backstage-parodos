import { Box, Fade, makeStyles, Paper } from '@material-ui/core';
import assert from 'assert-ts';
import React, { useLayoutEffect, useState } from 'react';
import { useWorkflowContext } from '../WorkflowContext';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { waitForElement } from '../../../../utils/wait';
import { DEFAULT_TASK_HEIGHT } from './useDemoPipelineNodes';

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: 'transparent',
    borderRadius: theme.spacing(2),
    zIndex: 33,
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

export function ExternalInputRequiredAlert(): JSX.Element | null {
  const { externaInputTask } = useWorkflowContext();
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [{ top, left }, setDimensions] = useState({ top: -999, left: -999 });

  assert(!!externaInputTask, `no workflowTask in WorkflowContext`);

  useLayoutEffect(() => {
    async function positionAlert() {
      const el = await waitForElement('.external-task');

      const domRect = el.getBoundingClientRect();

      setDimensions({
        top: domRect.top + window.scrollY + DEFAULT_TASK_HEIGHT,
        left: domRect.left + window.scrollX + 5,
      });

      setOpen(true);
    }

    setTimeout(positionAlert);
  }, []);

  return (
    <Fade in={open} timeout={500}>
      <Box
        style={{ position: 'absolute', top, left }}
        className={styles.container}
      >
        <Paper elevation={4}>
          <div className={styles.message}>
            <div>
              Some notification message for {externaInputTask?.label} and a link{' '}
            </div>
            <div className={styles.icon}>
              <OpenInNewIcon />
            </div>
          </div>
        </Paper>
      </Box>
    </Fade>
  );
}
