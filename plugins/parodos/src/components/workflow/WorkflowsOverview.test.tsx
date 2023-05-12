import React from 'react';
import { wrapInTestApp } from '@backstage/test-utils';
import { render, waitFor } from '@testing-library/react';
import { useTheme } from '@material-ui/core';

import { TestApp } from '../TestApp';
import { WorkflowsOverview } from './WorkflowsOverview';

jest.mock('@material-ui/core/styles', () => {
  const originalModule = jest.requireActual('@material-ui/core/styles');
  return {
    ...originalModule,
    useTheme: jest.fn(),
  };
});
const useThemeMock = useTheme as jest.Mock;

describe('WorkflowsOverview', () => {
  beforeEach(() => {
    useThemeMock.mockClear();
  });

  it('renders correctly', async () => {
    useThemeMock.mockReturnValue({
      transitions: {
        duration: {
          shortest: 100,
        },
      },
    });
    const rendered = render(
      wrapInTestApp(() => {
        return (
          <TestApp>
            <WorkflowsOverview />
          </TestApp>
        );
      }),
    );
    const { getByTestId, container } = rendered;
    expect(getByTestId('button-add-new-project').textContent).toBe(
      'Add new project',
    );
    expect(getByTestId('button-add-new-project')).toBeEnabled();
    expect(getByTestId('button-add-new-project')).toHaveAttribute(
      'href',
      '/parodos/onboarding',
    );
    waitFor(() => {
      expect(
        container.querySelector(
          'td[data-testid="511da8ce-4df7-438b-a9ec-0130f14884bd \'Running\'"]',
        ),
      ).toBeInTheDocument();
    });
  });
});
