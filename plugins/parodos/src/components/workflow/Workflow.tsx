import React, { useCallback, useEffect, useState } from 'react';
import {
  ContentHeader,
  InfoCard,
  SupportButton,
} from '@backstage/core-components';
import { errorApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { Form } from '../Form/Form';
import { ParodosPage } from '../ParodosPage';
import { Button, Grid, makeStyles, Typography } from '@material-ui/core';
import { useGetProjectAssessmentSchema } from './useGetProjectAssessmentSchema';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { IChangeEvent } from '@rjsf/core-v5';
import * as urls from '../../urls';
import { type Project, projectSchema } from '../../models/project';
import { WorkflowOptionsList } from './WorkflowOptionsList';
import { assert } from 'assert-ts';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { ProjectPicker } from '../Form/extensions/ProjectPicker/ProjectPicker';
import { ProjectsPayload, useCreateWorkflow, WorkflowOptionsListItem } from './hooks/useCreateWorkflow';

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
}));

function isProject(input?: string | Project): input is Project {
  return typeof input !== 'string' && typeof input?.id === 'string';
}

export function Workflow(): JSX.Element {
  const projectsUrl = useStore(state => state.getApiUrl(urls.Projects));
  const addProject = useStore(state => state.addProject);
  const hasProjects = useStore(state => state.hasProjects());
  const [isNewProject, setIsNewProject] = useState(true);
  const assessment = useStore(state => state.workflows.assessment);
  const assessmentTask = useStore(state => state.workflows.assessmentTask);
  const { fetch } = useApi(fetchApiRef);

  const [project, setProject] = useState<Project | undefined>();
  const [assessmentStatus, setAssessmentStatus] =
    useState<AssessmentStatusType>('none');
  const [workflowOptions, setWorkflowOptions] = useState<
    WorkflowOptionsListItem[]
  >([]);
  const styles = useStyles();

  const formSchema = useGetProjectAssessmentSchema({
    hasProjects,
    newProject: isNewProject,
    workflows: { assessment, assessmentTask },
  });

  const [{ error: createWorkflowError }, createWorkflow] = useCreateWorkflow({ assessment, assessmentTask })

  const [{ error: startAssessmentError }, startAssessment] = useAsyncFn(
    async ({ formData }: IChangeEvent<Record<string, ProjectsPayload>>) => {
      assert(!!formData, `no formData`);

      setAssessmentStatus('inprogress');

      const newProjectResponse = await fetch(projectsUrl, {
        method: 'POST',
        body: JSON.stringify(formData[assessmentTask]),
      });

      if (!newProjectResponse.ok) {
        throw new Error(newProjectResponse.statusText);
      }

      const newProject = projectSchema.parse(await newProjectResponse.json());

      setProject(newProject);

      setWorkflowOptions(await createWorkflow({ workflowProject: newProject, formData }));

      setAssessmentStatus('complete');

      addProject(newProject);
    },
    [addProject, assessmentTask, createWorkflow, fetch, projectsUrl],
  );

  const errorApi = useApi(errorApiRef);

  useEffect(() => {
    if (startAssessmentError || createWorkflowError) {
      // eslint-disable-next-line no-console
      console.error(startAssessmentError ?? createWorkflowError);
      errorApi.post(new Error(`Creating assessment failed`));
    }
  }, [createWorkflowError, errorApi, startAssessmentError]);

  const changeHandler = useCallback(
    async (e: IChangeEvent<Record<string, ProjectsPayload>>) => {
      if (!e.formData?.[assessmentTask]) {
        return;
      }

      const { newProject: nextIsNewProject, project: selectedProject } =
        e.formData[assessmentTask];

      if (nextIsNewProject !== isNewProject) {
        setProject(undefined);
        setIsNewProject(nextIsNewProject);
      }

      if (nextIsNewProject === false && isProject(selectedProject)) {
        await createWorkflow({
          workflowProject: selectedProject,
          formData: e.formData,
        });
      }
    },
    [assessmentTask, createWorkflow, isNewProject],
  );

  const inProgress = assessmentStatus === 'inprogress';
  const complete = assessmentStatus === 'complete';

  const disableForm = inProgress || complete;

  const displayOptions = assessmentStatus === 'complete' && project;

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
                onChange={changeHandler}
                hideTitle
                stepLess
                // TODO: fix typing with fields
                fields={{ ProjectPicker: ProjectPicker as any }}
              >
                {isNewProject ? (
                  <Button
                    type="submit"
                    disabled={disableForm ?? inProgress}
                    variant="contained"
                    color="primary"
                  >
                    {inProgress ? 'IN PROGRESS' : 'START ASSESSMENT'}
                  </Button>
                ) : (
                  <></>
                )}
              </Form>
            </Grid>
            <Grid item xs={12}>
              {displayOptions && (
                <WorkflowOptionsList
                  isNew={isNewProject}
                  project={project}
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
