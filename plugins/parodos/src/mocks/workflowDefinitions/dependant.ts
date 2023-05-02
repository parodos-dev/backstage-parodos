import { WorkflowDefinition } from '../../models/workflowDefinitionSchema';

export const mockDependantDefinition: WorkflowDefinition = {
  id: "3355f000-3d03-4210-ba99-a4e3227d8eea",
  name: "complexWorkFlow",
  type: "INFRASTRUCTURE",
  processingType: "SEQUENTIAL",
  author: null,
  createDate: "2023-05-02T09:53:35.450+00:00",
  modifyDate: "2023-05-02T09:53:35.450+00:00",
  parameters: {
    projectUrl: {
      format: "url",
      description: "The project url",
      type: "string",
      required: false
    },
    WORKFLOW_SELECT_SAMPLE: {
      valueProviderName: "complexWorkFlowValueProvider",
      format: "select",
      description: "Workflow select parameter sample",
      type: "string",
      required: false,
      enum: ["option1", "option2"]
    },
    WORKFLOW_MULTI_SELECT_SAMPLE: {
      format: "multi-select",
      description: "Workflow multi-select parameter sample",
      type: "string",
      required: false
    },
    workloadId: {
      format: "text",
      description: "The workload id",
      type: "string",
      required: true
    },
    DYNAMIC_TEXT_SAMPLE: {
      format: "text",
      description: "dynamic text sample",
      type: "string",
      required: false
    }
  },
  works: [{
    id: "2adf7c71-37bf-4c58-9e39-6120eb7e2e29",
    name: "subWorkFlowThree",
    workType: "WORKFLOW",
    processingType: "PARALLEL",
    works: [{
      id: "a257d64f-28d9-4f63-bc86-419eb95574f9",
      name: "sslCertificationWorkFlowTask",
      workType: "TASK",
      parameters: {
        domainName: {
          format: "url",
          description: "The domain name",
          type: "string",
          required: true
        },
        ipAddress: {
          format: "text",
          description: "The api address",
          type: "string",
          required: true
        }
      },
      outputs: ["HTTP2XX"]
    }, {
      id: "9f537b50-c7eb-4a82-860b-c1c932f826c9",
      name: "subWorkFlowTwo",
      workType: "WORKFLOW",
      processingType: "SEQUENTIAL",
      works: [{
        id: "9630039f-3f8e-4e0b-b54c-6d1648880c7f",
        name: "subWorkFlowOne",
        workType: "WORKFLOW",
        processingType: "PARALLEL",
        works: [{
          id: "88f24e7f-6a33-4cb5-8adc-d518159fc648",
          name: "adGroupsWorkFlowTask",
          workType: "TASK",
          parameters: {
            adGroups: {
              format: "text",
              description: "The ad groups",
              type: "string",
              required: true
            },
            ['dynamic-options']: {
              format: "select",
              description: "Dynamic options",
              type: "string",
              required: false
            },
            userId: {
              format: "text",
              description: "The user id",
              type: "string",
              required: true
            }
          },
          outputs: ["HTTP2XX", "EXCEPTION"]
        }, {
          id: "41c256f6-34bb-4dd3-a2b9-5e2f18abe772",
          name: "splunkMonitoringWorkFlowTask",
          workType: "TASK",
          parameters: {
            hostname: {
              format: "text",
              description: "The hostname",
              type: "string",
              required: true
            },
            clusterName: {
              format: "text",
              description: "The cluster name",
              type: "string",
              required: true
            }
          },
          outputs: ["OTHER"]
        }],
        parameters: {
          comment: {
            format: "text",
            description: "The workflow comment",
            type: "string",
            required: true
          }
        }
      }, {
        id: "b6595350-7ad2-4d7a-8a31-ee44da84484d",
        name: "namespaceWorkFlowTask",
        workType: "TASK",
        parameters: {
          projectId: {
            description: "The project id",
            type: "number",
            required: true
          }
        },
        outputs: ["HTTP2XX"]
      }]
    }]
  }, {
    id: "22c40d1b-bacf-48de-95b8-7780a43503b8",
    name: "subWorkFlowFour",
    workType: "WORKFLOW",
    processingType: "PARALLEL",
    works: [{
      id: "9dba1008-cdf5-4e60-b6d0-66bd5de7ace8",
      name: "loadBalancerWorkFlowTask",
      workType: "TASK",
      parameters: {
        hostname: {
          format: "url",
          description: "The hostname",
          type: "string",
          required: true
        },
        appId: {
          format: "text",
          description: "The app id",
          type: "string",
          required: true
        }
      },
      outputs: ["HTTP2XX"]
    }, {
      id: "85a1e2f6-8d6d-4b40-b7a3-aeb882a0aeb4",
      name: "singleSignOnWorkFlowTask",
      workType: "TASK",
      parameters: {
        password: {
          format: "password",
          description: "The password",
          type: "string",
          required: true
        },
        userId: {
          format: "text",
          description: "The user id",
          type: "string",
          required: true
        }
      },
      outputs: ["OTHER"]
    }]
  }]
}