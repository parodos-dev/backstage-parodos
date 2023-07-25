import { type StrictRJSFSchema } from '@rjsf/utils';
import { mockTasksWithNoParams } from '../mocks/workflowDefinitions/tasksWithNoParameters';
import { WorkflowDefinition } from '../models/workflowDefinitionSchema';
import { getWorkflowsPayload } from './workflowsPayload';

describe('getWorkflowsPayload', () => {
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
          format: 'uri',
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
      const result = getWorkflowsPayload({
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
      const result = getWorkflowsPayload({
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

  describe('nested works value is assigned to payload', () => {
    const definition: WorkflowDefinition = {
      id: '42fe4ef1-ab23-44d9-b306-43874367e9c8',
      name: 'move2KubeWorkFlow_INFRASTRUCTURE_WORKFLOW',
      type: 'INFRASTRUCTURE',
      processingType: 'SEQUENTIAL',
      author: null,
      createDate: '2023-07-24T14:11:58.245+00:00',
      modifyDate: '2023-07-24T14:11:58.245+00:00',
      works: [
        {
          id: '69f2eb6b-fc6e-4f57-92dc-0ba38134d90a',
          name: 'preparationWorkflow',
          workType: 'WORKFLOW',
          processingType: 'PARALLEL',
          works: [
            {
              id: 'b8e1f482-d203-431c-b7ac-0b43ebb950da',
              name: 'getSources',
              workType: 'WORKFLOW',
              processingType: 'SEQUENTIAL',
              works: [
                {
                  id: '388590b8-aa8c-427c-8f8d-8e7c64d345d7',
                  name: 'gitCloneTask',
                  workType: 'TASK',
                },
                {
                  id: 'e7ee4694-ca24-444a-af44-41d01dd7c924',
                  name: 'gitBranchTask',
                  workType: 'TASK',
                  parameters: {
                    branch: {
                      format: 'text',
                      description: 'branch whichs need to be created',
                      type: 'string',
                      required: true,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const schema = {
      gitPushTask: {
        credentials: 'AAA',
        remote: 'AAA',
      },
      move2KubeWorkFlow_INFRASTRUCTURE_WORKFLOW: {
        credentials: 'AAA',
        uri: 'AAAA',
        branch: 'AAAA',
      },
      getSources: {
        works: [
          {
            gitBranchTask: {
              branch: 'theBranch',
            },
          },
        ],
      },
      gitCommitTask: {
        commitMessage: 'AAA',
      },
    };

    it('should extract the correct value', () => {
      const result = getWorkflowsPayload({
        projectId: '111',
        workflow: definition,
        schema: schema as StrictRJSFSchema,
      });

      expect(result?.works?.[0]?.works?.[0]?.works?.[1].arguments[0]).toEqual({
        key: 'branch',
        value: 'theBranch',
      });
    });
  });
});
