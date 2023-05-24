// To be used in tests only.
import React from 'react';
// eslint-disable-next-line @backstage/no-undeclared-imports
import {
  MockConfigApi,
  MockFetchApi,
  TestApiProvider,
} from '@backstage/test-utils';
import { configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useInitializeStore } from '../hooks/useInitializeStore';

const MOCK_BASE_URL = 'https://example.com';
const MOCK_CONTEXT_URL = 'api/proxy/parodos';

const TestAppStore: React.FC = ({ children }) => {
  useInitializeStore();
  return <>{children}</>;
};

export const TestApp: React.FC = ({ children }) => {
  const mockConfig = new MockConfigApi({
    backend: { baseUrl: MOCK_BASE_URL },
    parodos: {
      workflows: {
        assessment: 'onboardingAssessment_ASSESSMENT_WORKFLOW',
        assessmentTask: 'onboardingAssessmentTask',
      },
      pollingInterval: 5000,
    },
  });
  const mockFetch = new MockFetchApi({
    baseImplementation: (
      input: RequestInfo | URL,
      // init?: RequestInit,
    ): Promise<Response> => {
      // TODO: The test case should pass the mocks as props to the component
      if (input === `${MOCK_BASE_URL}/${MOCK_CONTEXT_URL}/projects`) {
        return new Promise(resolve => {
          resolve(
            new Response(
              JSON.stringify([
                {
                  id: '511da8ce-4df7-438b-a9ec-0130f14884bd',
                  name: 'myProject',
                  description: 'My descrition',
                  createDate: '2023-04-14T07:55:38.144+00:00',
                  modifyDate: '2023-04-14T07:55:38.144+00:00',
                  username: 'test',
                },
              ]),
            ),
          );
        });
      }

      if (
        input ===
        `${MOCK_BASE_URL}/${MOCK_CONTEXT_URL}/workflows?projectId=511da8ce-4df7-438b-a9ec-0130f14884bd`
      ) {
        return new Promise(resolve => {
          resolve(
            new Response(
              JSON.stringify([
                {
                  workFlowExecutionId: '511da8ce-4df7-438b-a9ec-0130f14884bd',
                  projectId: '511da8ce-4df7-438b-a9ec-0130f14884bd',
                  workFlowName: 'myWorkflow',
                  workStatus: 'IN_PROGRESS',
                  startDate: '2023-04-14T07:55:38.144+00:00',
                  endDate: '2023-04-14T07:55:38.144+00:00',
                  executeBy: 'test',
                },
              ]),
            ),
          );
        });
      }

      if (
        input === `${MOCK_BASE_URL}/${MOCK_CONTEXT_URL}/workflowdefinitions`
      ) {
        return new Promise(resolve => {
          resolve(new Response(JSON.stringify([])));
        });
      }

      return new Promise((_, reject) => {
        reject(new Error(`Not mocked: ${input}`));
      });
    },
  });

  return (
    <TestApiProvider
      apis={[
        [configApiRef, mockConfig],
        [fetchApiRef, mockFetch],
      ]}
    >
      <TestAppStore>{children}</TestAppStore>
    </TestApiProvider>
  );
};
