import React, { useEffect, useState } from 'react';
import {
  ContentHeader,
  InfoCard,
  SupportButton,
} from '@backstage/core-components';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { Form } from '../Form/Form';
import { ParodosPage } from '../ParodosPage';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useGetProjectAssessmentSchema } from './useGetProjectAssessmentSchema';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { IChangeEvent } from '@rjsf/core-v5';
import { WorkflowOptionsList } from './WorkflowOptionsList';
import { assert } from 'assert-ts';
import { useStore } from '../../stores/workflowStore/workflowStore';
import {
  ProjectsPayload,
  useCreateWorkflow,
  WorkflowOptionsListItem,
} from './hooks/useCreateWorkflow';
import { useSearchParams } from 'react-router-dom';
import { ProgressBar } from '../ProgressBar/ProgressBar';

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
  progress: {},
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
  const isNewProject = searchParams.get('isnew') === 'true';

  const [assessmentStatus, setAssessmentStatus] =
    useState<AssessmentStatusType>('none');
  const [workflowOptions, setWorkflowOptions] = useState<
    WorkflowOptionsListItem[]
  >([]);
  const styles = useStyles();

  const formSchema = useGetProjectAssessmentSchema();

  const [{ error: createWorkflowError }, createWorkflow] = useCreateWorkflow({
    assessment,
  });

  const [{ error: startAssessmentError }, startAssessment] = useAsyncFn(
    async ({ formData }: IChangeEvent<Record<string, ProjectsPayload>>) => {
      assert(!!formData, `no formData`);

      setAssessmentStatus('inprogress');

      setWorkflowOptions(
        await createWorkflow({ project: selectedProject, formData }),
      );

      setAssessmentStatus('complete');
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

  const inProgress = assessmentStatus === 'inprogress';
  const complete = assessmentStatus === 'complete';

  const disableForm = inProgress || complete;

  const displayOptions = assessmentStatus === 'complete';

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
            </Grid>
            <Grid item xs={12}>
              {displayOptions && (
                <WorkflowOptionsList
                  isNew={isNewProject}
                  project={selectedProject}
                  workflowOptions={workflowOptions}
                />
              )}
            </Grid>
          </Grid>
        </InfoCard>
      )}
    </ParodosPage>
  );
}
