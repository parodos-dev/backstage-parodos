import { Box, Fade, makeStyles, Paper } from '@material-ui/core';
import assert from 'assert-ts';
import React, { useLayoutEffect, useState } from 'react';
import { useWorkflowContext } from '../WorkflowContext';
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

interface ExternalInputRequiredAlertProps {
  task: WorkflowTask;
}

export function ExternalInputRequiredAlert({
  task,
}: ExternalInputRequiredAlertProps): JSX.Element | null {
  const { externaInputTask } = useWorkflowContext();
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [{ top, left }, setDimensions] = useState({ top: -999, left: -999 });

  assert(!!externaInputTask, `no workflowTask in WorkflowContext`);

  useLayoutEffect(() => {
    async function positionAlert() {
      let el: HTMLElement | null;

      try {
        el = await waitForElement('.external-task');

        const domRect = el.getBoundingClientRect();

        setDimensions({
          top: domRect.top + window.scrollY + DEFAULT_TASK_HEIGHT * 2,
          left: domRect.left + window.scrollX + 5,
        });
      } catch {
        // unfortunately in smaller resolutions, patternfly/react-topology does
        // not show the taskIcon so the .external-task selector will fail
        // In this case we center at the bottom of the svg
        el = document.querySelector('.pf-topology-visualization-surface__svg');

        if (!el) {
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
      <Box
        style={{ position: 'absolute', top, left }}
        className={styles.container}
      >
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
