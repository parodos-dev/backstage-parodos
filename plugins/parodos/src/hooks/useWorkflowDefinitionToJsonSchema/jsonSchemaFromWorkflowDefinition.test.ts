import { mockRecursiveWorksWorkflowDefinition } from '../../mocks/workflowDefinitions/recursiveWorks';
import {
  jsonSchemaFromWorkflowDefinition,
  UriPattern,
} from './jsonSchemaFromWorkflowDefinition';
import get from 'lodash.get';
import {
  WorkflowDefinition,
  WorkType,
} from '../../models/workflowDefinitionSchema';
import { mockDeepRecursiveWorks } from '../../mocks/workflowDefinitions/deepRecursiveWorks';
import { mockTasksWithNoParams } from '../../mocks/workflowDefinitions/tasksWithNoParameters';

describe('jsonSchemaFromWorkflowDefinition', () => {
  it('transforms a workflow definition with recursive works', () => {
    const result = jsonSchemaFromWorkflowDefinition(
      mockRecursiveWorksWorkflowDefinition as unknown as WorkflowDefinition,
      { steps: [] },
    );

    expect(result.steps.length).toBeGreaterThan(0);

    const childSchemaWorks = get(
      result.steps[0]?.schema,
      'properties.subWorkFlowOne.properties.works.items',
      [],
    ) as WorkType[];

    const childUiSchemaWorks = get(
      result.steps[0].uiSchema,
      'subWorkFlowOne.works.items',
    );

    expect(childSchemaWorks).toHaveLength(2);
    expect(childUiSchemaWorks).toHaveLength(2);
  });

  it('transforms deeply nested recursive structure', () => {
    const result = jsonSchemaFromWorkflowDefinition(mockDeepRecursiveWorks, {
      steps: [],
    });

    const domainName = get(
      result.steps[0]?.schema,
      'properties.sslCertificationWorkFlowTask.properties.domainName.title',
    );

    expect(domainName).toBe('domainName');
    const clusterName = get(
      result.steps[2]?.schema,
      'properties.subWorkFlowOne.properties.works.items[1].properties.splunkMonitoringWorkFlowTask.properties.clusterName.title',
    );

    expect(clusterName).toBe('clusterName');
  });

  it('adds valueProviderName to the schema', () => {
    const definition: WorkflowDefinition = {
      id: 'ea22c6ed-b7d4-48bf-98d2-f7c1c78643d8',
      name: 'prop',
      type: 'INFRASTRUCTURE',
      processingType: 'SEQUENTIAL',
      author: null,
      createDate: '2023-03-14T16:40:17.001+00:00',
      modifyDate: '2023-03-14T16:40:17.001+00:00',
      parameters: {
        WORKFLOW_SELECT_SAMPLE: {
          valueProviderName: 'complexWorkFlowValueProvider',
          format: 'select',
          description: 'Workflow select parameter sample',
          type: 'string',
          required: false,
          enum: ['option1', 'option2'],
        },
      },
      works: [],
    };

    const result = jsonSchemaFromWorkflowDefinition(definition, { steps: [] });

    const valueProviderName = get(
      result.steps[0]?.schema,
      'properties.prop.properties.WORKFLOW_SELECT_SAMPLE.valueProviderName',
    );

    expect(valueProviderName).toBe('complexWorkFlowValueProvider');
  });

  it('work items with no parameters and every child works has workType WORKFLOW', () => {
    const result = jsonSchemaFromWorkflowDefinition(mockTasksWithNoParams, {
      steps: [],
    });

    expect(result.steps).toHaveLength(1);

    const stepUI = get(
      result.steps[0]?.schema,
      'properties.getSources.properties.works.items[0].properties.gitCloneTask.properties',
    );

    expect(Object.keys(stepUI ?? {})).toEqual(['credentials', 'uri', 'branch']);
  });

  describe('uri validation', () => {
    it('should validate uris', () => {
      const urlRegex = new RegExp(UriPattern);

      // good
      expect(
        urlRegex.test('ssh://git@bitbucket.org:Example-org/spring-world.git'),
      ).toBe(true);
      expect(urlRegex.test('https://www.google.com')).toBe(true);
      expect(urlRegex.test('git@github.com:user/repo.git')).toBe(true);
      expect(urlRegex.test('google.com')).toBe(true);
      expect(urlRegex.test('www.google.com')).toBe(true);
      expect(urlRegex.test('https://github.com/dagda1/frontendsupport')).toBe(
        true,
      );

      // bad
      expect(urlRegex.test('aaaaaa')).toBe(false);
      expect(urlRegex.test('://www.google.com')).toBe(false);
      expect(urlRegex.test('http://www.google.com')).toBe(false);
      expect(
        urlRegex.test('gitaaa@bitbucket.org:Example-org/spring-world.git'),
      ).toBe(false);
    });
  });
});
