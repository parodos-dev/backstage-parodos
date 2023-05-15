import { WorkflowDefinition } from '../../models/workflowDefinitionSchema';

export const mockTasksWithNoParams: WorkflowDefinition = {
  id: 'de309484-f24e-43bb-992a-4f9306381b27',
  name: 'move2KubeWorkFlow_INFRASTRUCTURE_WORKFLOW',
  type: 'INFRASTRUCTURE',
  processingType: 'SEQUENTIAL',
  author: null,
  createDate: '2023-05-14T20:11:40.310+00:00',
  modifyDate: '2023-05-14T20:11:40.310+00:00',
  // properties: {
  //   version: null
  // },
  works: [
    {
      id: '115e2976-c4be-4ec0-bb09-06a3a2d1231f',
      name: 'preparationWorkflow',
      workType: 'WORKFLOW',
      processingType: 'PARALLEL',
      works: [
        {
          id: '431606c3-33ce-46ec-8742-2e76b7bb5753',
          name: 'getSources',
          workType: 'WORKFLOW',
          processingType: 'SEQUENTIAL',
          works: [
            {
              id: 'a7ec1d2b-beac-43ed-aacf-91b0f159c2e9',
              name: 'gitCloneTask',
              workType: 'TASK',
              parameters: {
                credentials: {
                  format: 'text',
                  description: 'Git credential',
                  type: 'string',
                  required: true,
                },
                uri: {
                  format: 'text',
                  description: 'Url to clone from',
                  type: 'string',
                  required: true,
                },
                branch: {
                  format: 'text',
                  description: 'Branch to clone from, default main',
                  type: 'string',
                  required: false,
                },
              },
            },
            {
              id: 'ebaa5066-bff1-4103-89dd-ef125b314893',
              name: 'gitArchiveTask',
              workType: 'TASK',
            },
          ],
        },
        {
          id: 'ecf4b510-9e4d-4e08-9338-d371d3b40959',
          name: 'move2KubeProject',
          workType: 'WORKFLOW',
          processingType: 'SEQUENTIAL',
          works: [
            {
              id: '950941ed-e753-4990-915d-e4c34bdffbf9',
              name: 'move2KubeTask',
              workType: 'TASK',
              outputs: ['HTTP2XX', 'OTHER'],
            },
          ],
        },
      ],
    },
    {
      id: 'e8262676-350e-4480-a987-d082cfc2737d',
      name: 'move2KubePlan',
      workType: 'TASK',
    },
    {
      id: '59712f15-97a6-42fd-acc1-a05855e4c215',
      name: 'move2KubeTransform',
      workType: 'TASK',
    },
  ],
};
