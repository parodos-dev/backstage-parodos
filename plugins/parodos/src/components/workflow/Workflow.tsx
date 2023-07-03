import React, { useCallback, useEffect, useReducer, useState } from 'react';
import {
  ContentHeader,
  InfoCard,
  SupportButton,
} from '@backstage/core-components';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { Form } from '../Form/Form';
import { ParodosPage } from '../ParodosPage';
import {
  Grid,
  makeStyles,
  Typography,
  Button,
  Collapse,
  Fade,
} from '@material-ui/core';
import { useGetProjectAssessmentSchema } from './useGetProjectAssessmentSchema';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { IChangeEvent } from '@rjsf/core-v5';
import { WorkflowOptionsList } from './WorkflowOptionsList';
import { assert } from 'assert-ts';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { ProjectsPayload, useCreateWorkflow } from './hooks/useCreateWorkflow';
import { useSearchParams } from 'react-router-dom';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import ChevronRight from '@material-ui/icons/ChevronRight';
import ChevronDown from '@material-ui/icons/KeyboardArrowDown';
import { WorkflowExplorer } from './workflowDetail/WorkflowExplorer';
import cs from 'classnames';
import {
  assessmentWorkflowInitialState,
  assessmentWorkflowReducer,
} from './assessmentReducer';

export type AssessmentStatusType = 'none' | 'inprogress' | 'complete';

const useStyles = makeStyles(theme => ({
  fullHeight: {
    height: '100%',
  },
  form: {
    '& .field-boolean > div > label': {
      display: 'inline-block',
      marginBottom: theme.spacing(2),
      '& + div': {
        flexDirection: 'row',
      },
    },
  },
  viewMoreButton: {
    textDecoration: 'underline',
  },
  running: {
    color: theme.palette.primary.main,
  },
}));

export function Workflow(): JSX.Element {
  const assessment = useStore(state => state.workflows.assessment);
  const workflowError = useStore(state => state.workflowError);
  const [searchParams] = useSearchParams();
  const selectedProject = useStore(state =>
    state.getProjectById(searchParams.get('project')),
  );
  const workflowProgress = useStore(state => state.workflowProgress);
  const cleanupWorkflow = useStore(state => state.cleanUpWorkflow);
  const [
    {
      workflowOptions,
      assessmentStatus,
      assessmentWorkflowExecutionId,
      showMoreWorkflows,
    },
    dispatch,
  ] = useReducer(assessmentWorkflowReducer, assessmentWorkflowInitialState);
  const [, setWorkflowName] = useState('');

  const styles = useStyles();

  const formSchema = useGetProjectAssessmentSchema();

  const [{ error: createWorkflowError }, createWorkflow] =
    useCreateWorkflow(assessment);

  const [{ error: startAssessmentError }, startAssessment] = useAsyncFn(
    async ({ formData }: IChangeEvent<Record<string, ProjectsPayload>>) => {
      assert(!!formData, `no formData`);

      dispatch({ type: 'START' });

      const { options, assessmentWorkflowExecutionId: workflowExecutionId } =
        await createWorkflow({
          projectId: selectedProject.id,
          formData,
        });

      if (!Array.isArray(options)) {
        return;
      }

      dispatch({
        type: 'COMPLETE',
        payload: {
          workflowOptions: options,
          assessmentWorkflowExecutionId: workflowExecutionId,
        },
      });
    },
    [createWorkflow, selectedProject],
  );

  const errorApi = useApi(errorApiRef);

  useEffect(() => {
    if (startAssessmentError || createWorkflowError || workflowError) {
      // eslint-disable-next-line no-console
      console.error(
        startAssessmentError ?? createWorkflowError ?? workflowError,
      );
      errorApi.post(new Error(`Creating assessment failed`));
    }
  }, [createWorkflowError, errorApi, startAssessmentError, workflowError]);

  useEffect(() => {
    return () => {
      cleanupWorkflow();
    };
  }, [cleanupWorkflow]);

  const showMoreWorkflowsToggle = useCallback(
    () => dispatch({ type: 'TOGGLE_SHOW_WORKFLOWS' }),
    [],
  );

  const inProgress = assessmentStatus === 'inprogress';
  const complete = assessmentStatus === 'complete';

  const disableForm = inProgress || complete;

  const displayOptions =
    assessmentStatus === 'complete' &&
    workflowOptions &&
    assessmentWorkflowExecutionId;

  return (
    <ParodosPage stretch>
      <ContentHeader title="Project assessment">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        Select a project for an assessment of what additional workflows, if any,
        it qualifies for.
      </Typography>
      {formSchema && (
        <InfoCard className={styles.fullHeight}>
          <Grid container direction="row" className={styles.form}>
            <Grid item xs={12} xl={8}>
              <Collapse
                in={!assessmentWorkflowExecutionId}
                timeout="auto"
                unmountOnExit
              >
                <Fade in={!assessmentWorkflowExecutionId} timeout={1000}>
                  <Form
                    formSchema={formSchema}
                    onSubmit={startAssessment}
                    disabled={disableForm}
                    finalSubmitButtonText={
                      inProgress ? 'IN PROGRESS' : 'START ASSESSMENT'
                    }
                  >
                    {(inProgress || complete) && (
                      <Grid item xs={7} xl={5}>
                        <ProgressBar
                          variant="circular"
                          value={complete ? 100 : workflowProgress ?? 1}
                        />
                      </Grid>
                    )}
                  </Form>
                </Fade>
              </Collapse>
            </Grid>
          </Grid>
          {assessmentWorkflowExecutionId && (
            <Fade in={!!assessmentWorkflowExecutionId} timeout={1000}>
              <>
                <WorkflowExplorer
                  setWorkflowName={setWorkflowName}
                  executionId={assessmentWorkflowExecutionId}
                >
                  <Grid xs={12}>
                    <Button
                      disabled={!assessmentWorkflowExecutionId}
                      onClick={showMoreWorkflowsToggle}
                      className={cs(styles.viewMoreButton, {
                        [styles.running]: assessmentStatus === 'complete',
                      })}
                    >
                      {showMoreWorkflows ? <ChevronDown /> : <ChevronRight />}
                      View More Workflows
                    </Button>
                    <Collapse
                      in={showMoreWorkflows}
                      timeout="auto"
                      unmountOnExit
                    >
                      {displayOptions && (
                        <Grid item xs={12}>
                          <WorkflowOptionsList
                            isNew
                            project={selectedProject}
                            workflowOptions={workflowOptions}
                            assessmentWorkflowExecutionId={
                              assessmentWorkflowExecutionId
                            }
                          />
                        </Grid>
                      )}
                    </Collapse>
                  </Grid>
                </WorkflowExplorer>
              </>
            </Fade>
          )}
        </InfoCard>
      )}
    </ParodosPage>
  );
}
