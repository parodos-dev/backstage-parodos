import { FetchApi } from '@backstage/core-plugin-api';
import { Project, projectSchema } from '../models/project';
import * as urls from '../urls';

export async function fetchProjects(fetch: FetchApi['fetch'], baseUrl: string) {
  const response = await fetch(`${baseUrl}${urls.Projects}`);
  const projectsResponse = await response.json();

  if ('error' in projectsResponse) {
    throw new Error(`${projectsResponse.error}: ${projectsResponse.path}`);
  }

  const projects = (projectsResponse?.map(projectSchema.parse) ??
    []) as Project[];

  return projects;
}
