import { type StrictRJSFSchema } from '@rjsf/utils';
import { mockTasksWithNoParams } from '../../../mocks/workflowDefinitions/tasksWithNoParameters';
import { WorkflowDefinition } from '../../../models/workflowDefinitionSchema';
import { getWorklfowsPayload } from './workflowsPayload';

describe('getWorksPayload', () => {
  describe('simple', () => {
    const mockMasterWorkFlow: WorkflowDefinition = {
      id: '2dfbb023-bf5e-426d-ad6c-451f77e73d25',
      name: 'masterWorkFlow',
      type: 'INFRASTRUCTURE',
      processingType: 'SEQUENTIAL',
      author: null,
      createDate: '2023-03-30T15:16:54.406+00:00',
      modifyDate: '2023-03-30T15:16:54.406+00:00',
      parameters: {
        projectUrl: {
          description: 'The project url',
          required: false,
          type: 'string',
          format: 'url',
        },
        workloadId: {
          description: 'The workload id',
          required: true,
          type: 'string',
          format: 'text',
        },
      },
      // TODO: flesh out for better test
      works: [],
    };

    const mockFormData = {
      masterWorkFlow: {
        projectUrl: 'https://g.com',
        workloadId: 'dfds',
      },
    };

    it('should transform formData to works payload', () => {
      const result = getWorklfowsPayload({
        projectId: '10',
        workflow: mockMasterWorkFlow,
        schema: mockFormData as StrictRJSFSchema,
      });

      expect(result).toEqual({
        projectId: '10',
        workFlowName: 'masterWorkFlow',
        arguments: [
          { key: 'projectUrl', value: 'https://g.com' },
          { key: 'workloadId', value: 'dfds' },
        ],
        works: [],
      });
    });
  });

  describe('few UI elements', () => {
    const schema = {
      getSources: {
        works: [
          {
            gitCloneTask: {
              credentials: 'git',
              uri: 'https://github.com/eloycoto/spring-helloworld.git',
              branch: 'main',
            },
          },
        ],
      },
    };

    it('should work with deeply nested schema', () => {
      const result = getWorklfowsPayload({
        projectId: '111',
        workflow: mockTasksWithNoParams,
        schema: schema as StrictRJSFSchema,
      });

      expect(result.works?.[0]?.works?.[0]?.works?.[0]?.arguments).toEqual([
        {
          key: 'credentials',
          value: 'git',
        },
        {
          key: 'uri',
          value: 'https://github.com/eloycoto/spring-helloworld.git',
        },
        {
          key: 'branch',
          value: 'main',
        },
      ]);
    });
  });
});
