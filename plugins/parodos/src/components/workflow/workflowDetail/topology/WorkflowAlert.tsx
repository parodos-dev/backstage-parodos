import { Box, Fade, makeStyles, Paper } from '@material-ui/core';
import assert from 'assert-ts';
import React, { useLayoutEffect, useState } from 'react';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { waitForElement } from '../../../../utils/wait';
import {
  DEFAULT_TASK_HEIGHT,
  DEFAULT_TASK_WIDTH,
} from './useDemoPipelineNodes';
import { WorkflowTask } from '../../../../models/workflowTaskSchema';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { renderers } from '../../../markdown/renderers';

const useStyles = makeStyles(theme => ({
  container: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderRadius: theme.spacing(2),
    zIndex: 33,
  },
  message: {
    display: 'flex',
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
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

interface WorkflowAlertProps {
  task: WorkflowTask;
}

export function WorkflowAlert({
  task,
}: WorkflowAlertProps): JSX.Element | null {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [{ top, left }, setDimensions] = useState({
    top: window.innerHeight / 2,
    left: window.innerWidth / 2,
  });

  useLayoutEffect(() => {
    async function positionAlert() {
      let el: HTMLElement | null;

      try {
        el = await waitForElement('.workflow-alert');

        const domRect = el.getBoundingClientRect();

        setDimensions({
          top: domRect.top + window.scrollY + DEFAULT_TASK_HEIGHT + 10,
          left: domRect.left + window.scrollX + 5,
        });
      } catch {
        // unfortunately in smaller resolutions, patternfly/react-topology does
        // not show the taskIcon so the .workflow-alert selector will fail
        // In this case we center at the bottom of the svg
        el = document.querySelector('.pf-topology-visualization-surface__svg');

        if (!el) {
          // this really should not happen but center on screen
          setOpen(true);
          return;
        }

        const domRect = el.getBoundingClientRect();

        setDimensions({
          top: domRect.bottom + window.scrollY,
          left: domRect.left + window.scrollX + DEFAULT_TASK_WIDTH,
        });
      }

      setOpen(true);
    }

    setTimeout(positionAlert);
  }, []);

  assert(
    !!task.alertMessage,
    `we are try to render an alert with no alertMessage`,
  );

  return (
    <Fade in={open} timeout={500}>
      <Box style={{ top, left }} className={styles.container}>
        <Paper elevation={4}>
          <div className={styles.message}>
            <div>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={renderers}>
                {task.alertMessage}
              </ReactMarkdown>
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
