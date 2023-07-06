import React from 'react';
import { mockAndromedaWorkflowDefinition } from '../../mocks/workflowDefinitions/andromeda';
import { FormSchema } from '../types';
import { jsonSchemaFromWorkflowDefinition } from '../../hooks/useWorkflowDefinitionToJsonSchema/jsonSchemaFromWorkflowDefinition';
import { act, fireEvent, render } from '@testing-library/react';
import { Form } from './Form';

// very simple test to at least check we have not broken the JSONForm
describe('<Form />', () => {
  describe('no stepper', () => {
    const mockWorkflow = {
      ...mockAndromedaWorkflowDefinition,
      works: [mockAndromedaWorkflowDefinition.works[0]],
    };
    const formSchema: FormSchema = jsonSchemaFromWorkflowDefinition(
      mockWorkflow,
      { steps: [] },
    );

    it('renders a basic dynamic form', () => {
      const { getByRole } = render(
        <Form formSchema={formSchema} onSubmit={jest.fn()} />,
      );

      expect(getByRole('textbox', { name: 'api-server' })).toBeInTheDocument();
    });

    it('can submit the form', async () => {
      const onSubmit = jest.fn();

      const { getByRole } = render(
        <Form formSchema={formSchema} onSubmit={onSubmit} />,
      );

      await fireEvent.change(getByRole('textbox', { name: 'api-server' }), {
        target: { value: 'https://someurl.com' },
      });

      await act(async () => {
        await fireEvent.click(getByRole('button', { name: 'NEXT' }));
      });

      expect(onSubmit).toHaveBeenCalled();
    });

    it('can submit the form with ssh url', async () => {
      const onSubmit = jest.fn();

      const { getByRole } = render(
        <Form formSchema={formSchema} onSubmit={onSubmit} />,
      );

      await fireEvent.change(getByRole('textbox', { name: 'api-server' }), {
        target: {
          value: 'ssh://git@bitbucket.org:Example-org/spring-world.git',
        },
      });

      await act(async () => {
        await fireEvent.click(getByRole('button', { name: 'NEXT' }));
      });

      expect(onSubmit).toHaveBeenCalled();
    });

    it('cannot submit the form with invalid git url', async () => {
      const onSubmit = jest.fn();

      const { getByRole } = render(
        <Form formSchema={formSchema} onSubmit={onSubmit} />,
      );

      await fireEvent.change(getByRole('textbox', { name: 'api-server' }), {
        target: {
          value: 'gitaaa@bitbucket.org:Example-org/spring-world.git',
        },
      });

      await act(async () => {
        await fireEvent.click(getByRole('button', { name: 'NEXT' }));
      });

      expect(onSubmit).not.toHaveBeenCalled();

      await fireEvent.change(getByRole('textbox', { name: 'api-server' }), {
        target: {
          value: 'aaaa',
        },
      });

      await act(async () => {
        await fireEvent.click(getByRole('button', { name: 'NEXT' }));
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('with stepper', () => {
    const formSchema: FormSchema = jsonSchemaFromWorkflowDefinition(
      mockAndromedaWorkflowDefinition,
      { steps: [] },
    );

    it('renders a stepper with more than one task', () => {
      const { getByRole } = render(
        <Form formSchema={formSchema} onSubmit={jest.fn()} />,
      );

      expect(getByRole('textbox', { name: 'api-server' })).toBeInTheDocument();

      expect(getByRole('button', { name: 'PREVIOUS' })).toBeInTheDocument();
      expect(getByRole('button', { name: 'NEXT' })).toBeInTheDocument();
    });

    it('can submit the multi-step form', async () => {
      const onSubmit = jest.fn();

      const { getByRole, getByText } = render(
        <Form formSchema={formSchema} onSubmit={onSubmit} />,
      );

      expect(getByText('Ad Group Work Flow Task')).toBeInTheDocument();

      await fireEvent.change(getByRole('textbox', { name: 'api-server' }), {
        target: { value: 'https://someurl.com' },
      });

      await act(async () => {
        await fireEvent.click(getByRole('button', { name: 'NEXT' }));
      });

      await fireEvent.change(getByRole('textbox', { name: 'param1' }), {
        target: { value: 'some text' },
      });

      await act(async () => {
        await fireEvent.click(getByRole('button', { name: 'NEXT' }));
      });

      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
