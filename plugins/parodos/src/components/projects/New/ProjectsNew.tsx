import {
  ContentHeader,
  InfoCard,
  SupportButton,
} from '@backstage/core-components';
import { Button, Typography } from '@material-ui/core';
import React, { useEffect } from 'react';
import { Form } from '../../Form/Form';
import { ParodosPage } from '../../ParodosPage';
import { newProjectStep } from './newProjectFormSchema';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { IChangeEvent } from '@rjsf/core-v5';
import { errorApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { projectSchema } from '../../../models/project';
import { assert } from 'assert-ts';
import { ProjectsPayload } from '../../workflow/hooks/useCreateWorkflow';
import * as urls from '../../../urls';

export function ProjectsNew(): JSX.Element {
  const projectsUrl = useStore(state => state.getApiUrl(urls.Projects));
  const addProject = useStore(state => state.addProject);
  const { fetch } = useApi(fetchApiRef);
  const errorApi = useApi(errorApiRef);

  const [{ error, loading }, createNewProject] = useAsyncFn(
    async ({
      formData,
    }: IChangeEvent<
      Record<string, Pick<ProjectsPayload, 'name' | 'description'>>
    >) => {
      assert(!!formData, `no formData`);

      const newProjectResponse = await fetch(projectsUrl, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (!newProjectResponse.ok) {
        throw new Error(newProjectResponse.statusText);
      }

      const newProject = projectSchema.parse(await newProjectResponse.json());

      addProject(newProject);
    },
    [addProject, fetch, projectsUrl],
  );

  useEffect(() => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      errorApi.post(new Error(`Creating new project failed`));
    }
  }, [error, errorApi]);

  return (
    <ParodosPage>
      <ContentHeader title="New Project">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>New project</Typography>
      <InfoCard>
        <Typography paragraph>
          Please provide additional information related to your project.
        </Typography>
        <Form
          formSchema={{ steps: [newProjectStep] }}
          onSubmit={createNewProject}
          disabled={loading}
        >
          <Button>Fuck</Button>
        </Form>
      </InfoCard>
    </ParodosPage>
  );
}
