import { Select, SelectedItems } from '@backstage/core-components';
import {
  configApiRef,
  errorApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { fetchProjects, Project } from '@parodos/plugin-parodos';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { FieldProps } from '@rjsf/core';
import { FormControl } from '@material-ui/core';

export function ProjectSelect({
  onChange,
  rawErrors,
  required,
  formData,
}: FieldProps<{ id: string; name: string }>) {
  const { fetch } = useApi(fetchApiRef);
  const errorApi = useApi(errorApiRef);
  const configApi = useApi(configApiRef);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [{ error: fetchProjectsError }, fetchProjectsFn] = useAsyncFn(
    async () =>
      setProjects(
        await fetchProjects(fetch, configApi.getString('backend.baseUrl')),
      ),
    [fetch, configApi],
  );

  const handleChange = useCallback(
    (items: SelectedItems) => {
      if (typeof items === 'string') {
        setProjectId(items);
        onChange({
          id: items,
          name: projects.find(project => project.id === items)?.name,
        });
      }
    },
    [projects, onChange],
  );

  const items = useMemo(
    () =>
      projects.map(project => ({
        label: project.name,
        value: project.id,
      })),
    [projects],
  );

  useEffect(() => {
    fetchProjectsFn();
  }, [fetchProjectsFn]);

  useEffect(() => {
    if (fetchProjectsError) {
      // eslint-disable-next-line no-console
      console.error(fetchProjectsError);

      errorApi.post(new Error('Fetch projects failed'));
    }
  }, [errorApi, fetchProjectsError]);

  return (
    <FormControl
      margin="normal"
      required={required}
      error={rawErrors?.length > 0 && !formData}
    >
      <Select
        label={'Select a project'.toUpperCase()}
        placeholder={projectId ? undefined : 'Project name'}
        items={items}
        selected={projectId}
        onChange={handleChange}
      />
    </FormControl>
  );
}
