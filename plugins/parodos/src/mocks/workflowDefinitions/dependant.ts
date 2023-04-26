export const mockDependantDefinition = {
  id: '3316b504-1000-4d12-95fc-a0a56790c929',
  name: 'complexWorkFlow',
  type: 'INFRASTRUCTURE',
  processingType: 'SEQUENTIAL',
  author: null,
  createDate: '2023-04-26T10:44:21.015+00:00',
  modifyDate: '2023-04-26T10:44:21.015+00:00',
  parameters: {
    projectUrl: {
      format: 'url',
      description: 'The project url',
      type: 'string',
      required: false,
    },
    WORKFLOW_SELECT_SAMPLE: {
      valueProviderName: 'complexWorkFlowValueProvider',
      format: 'select',
      description: 'Workflow select parameter sample',
      type: 'string',
      required: false,
      enum: ['option1', 'option2'],
    },
    WORKFLOW_MULTI_SELECT_SAMPLE: {
      format: 'multi-select',
      description: 'Workflow multi-select parameter sample',
      type: 'string',
      required: false,
      enum: ['multi1', 'multi2'],
    },
    workloadId: {
      format: 'text',
      description: 'The workload id',
      type: 'string',
      required: true,
    },
    DYNAMIC_TEXT_SAMPLE: {
      format: 'text',
      description: 'dynamic text sample',
      type: 'string',
      required: false,
    },
  },
  properties: {
    version: null,
  },
  works: [
    {
      id: '92ee48b4-daad-4fac-acde-f4c4d8ea0425',
      name: 'subWorkFlowThree',
      workType: 'WORKFLOW',
      processingType: 'PARALLEL',
      works: [
        {
          id: 'aaf36831-808c-41ff-85a9-cd92ab66ed3c',
          name: 'sslCertificationWorkFlowTask',
          workType: 'TASK',
          parameters: {
            domainName: {
              format: 'url',
              description: 'The domain name',
              type: 'string',
              required: true,
            },
            ipAddress: {
              format: 'text',
              description: 'The api address',
              type: 'string',
              required: true,
            },
          },
          outputs: ['HTTP2XX'],
        },
        {
          id: 'e64074e4-b669-436c-88a8-b0abd71cc582',
          name: 'subWorkFlowTwo',
          workType: 'WORKFLOW',
          processingType: 'SEQUENTIAL',
          works: [
            {
              id: '69414994-3ec8-4770-9870-824aef733499',
              name: 'subWorkFlowOne',
              workType: 'WORKFLOW',
              processingType: 'PARALLEL',
              works: [
                {
                  id: '90bdfacf-4d7a-41df-a363-0c3cd7b75f18',
                  name: 'adGroupsWorkFlowTask',
                  workType: 'TASK',
                  parameters: {
                    adGroups: {
                      format: 'text',
                      description: 'The ad groups',
                      type: 'string',
                      required: true,
                    },
                    userId: {
                      format: 'text',
                      description: 'The user id',
                      type: 'string',
                      required: true,
                    },
                  },
                  outputs: ['HTTP2XX', 'EXCEPTION'],
                },
                {
                  id: '3cbb3f95-fc0e-4d73-bc73-262756e5913f',
                  name: 'splunkMonitoringWorkFlowTask',
                  workType: 'TASK',
                  parameters: {
                    hostname: {
                      format: 'text',
                      description: 'The hostname',
                      type: 'string',
                      required: true,
                    },
                    clusterName: {
                      format: 'text',
                      description: 'The cluster name',
                      type: 'string',
                      required: true,
                    },
                  },
                  outputs: ['OTHER'],
                },
              ],
              parameters: {
                comment: {
                  format: 'text',
                  description: 'The workflow comment',
                  type: 'string',
                  required: true,
                },
              },
            },
            {
              id: '88c40f17-3b5a-4c04-905e-250cca2b1f5a',
              name: 'namespaceWorkFlowTask',
              workType: 'TASK',
              parameters: {
                projectId: {
                  description: 'The project id',
                  type: 'number',
                  required: true,
                },
              },
              outputs: ['HTTP2XX'],
            },
          ],
        },
      ],
    },
    {
      id: '81cba09d-85e9-440d-9163-0039ed26c972',
      name: 'subWorkFlowFour',
      workType: 'WORKFLOW',
      processingType: 'PARALLEL',
      works: [
        {
          id: '0212de18-f5dd-437d-a2f7-cd33700afd12',
          name: 'loadBalancerWorkFlowTask',
          workType: 'TASK',
          parameters: {
            hostname: {
              format: 'url',
              description: 'The hostname',
              type: 'string',
              required: true,
            },
            appId: {
              format: 'text',
              description: 'The app id',
              type: 'string',
              required: true,
            },
          },
          outputs: ['HTTP2XX'],
        },
        {
          id: 'b09f6bcd-64e4-4079-bc4a-67976c819bb4',
          name: 'singleSignOnWorkFlowTask',
          workType: 'TASK',
          parameters: {
            password: {
              format: 'password',
              description: 'The password',
              type: 'string',
              required: true,
            },
            userId: {
              format: 'text',
              description: 'The user id',
              type: 'string',
              required: true,
            },
          },
          outputs: ['OTHER'],
        },
      ],
    },
  ],
};
