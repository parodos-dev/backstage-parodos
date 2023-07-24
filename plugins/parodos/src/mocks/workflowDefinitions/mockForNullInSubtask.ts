import { WorkflowDefinition } from '../../models/workflowDefinitionSchema';

export const mockForNullInSubtask: WorkflowDefinition = {
  id: '42fe4ef1-ab23-44d9-b306-43874367e9c8',
  name: 'move2KubeWorkFlow_INFRASTRUCTURE_WORKFLOW',
  type: 'INFRASTRUCTURE',
  processingType: 'SEQUENTIAL',
  author: null,
  createDate: '2023-07-24T14:11:58.245+00:00',
  modifyDate: '2023-07-24T14:11:58.245+00:00',
  parameters: {
    credentials: {
      format: 'text',
      description: 'Git credential',
      type: 'string',
      required: true,
    },
    uri: {
      format: 'text',
      description: 'git repo uri',
      type: 'string',
      required: true,
    },
    branch: {
      format: 'text',
      description: 'Branch to clone from, default main',
      type: 'string',
      required: true,
    },
  },
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
            {
              id: '7a16deab-ad9f-45fe-8ff0-710817ee99c9',
              name: 'gitArchiveTask',
              workType: 'TASK',
            },
          ],
        },
        {
          id: 'bf097180-b78a-4050-9a91-f16d724c5710',
          name: 'move2KubeProject',
          workType: 'WORKFLOW',
          processingType: 'SEQUENTIAL',
          works: [
            {
              id: '4639b33e-9075-47fb-8635-47b71c50aada',
              name: 'move2KubeTask',
              workType: 'TASK',
            },
          ],
        },
      ],
    },
    {
      id: 'e9655e57-b8f7-470a-981e-782be97436a9',
      name: 'move2KubePlan',
      workType: 'TASK',
    },
    {
      id: '2f2e1e8d-f82e-4080-9e2e-ed87eba6794f',
      name: 'move2KubeTransform',
      workType: 'TASK',
    },
    {
      id: 'e2b96dfa-2da5-4909-8e71-c8d27c20a355',
      name: 'move2KubeRetrieve',
      workType: 'TASK',
    },
    {
      id: 'c4b40cc3-4bc4-42cc-976d-ccc6b8bf599c',
      name: 'gitCommitTask',
      workType: 'TASK',
      parameters: {
        commitMessage: {
          format: 'text',
          description: 'Commit message for all the files',
          type: 'string',
          required: true,
        },
      },
    },
    {
      id: '8ea6f3ab-6468-4487-8d98-e95af8b107bd',
      name: 'gitPushTask',
      workType: 'TASK',
      parameters: {
        credentials: {
          format: 'text',
          description: 'Git credential',
          type: 'string',
          required: false,
        },
        remote: {
          format: 'text',
          description: 'path where the git repo is located',
          type: 'string',
          required: true,
        },
      },
    },
  ],
};
