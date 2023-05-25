import React, { type FC } from 'react';
import { Content, Page } from '@backstage/core-components';
import { PageHeader } from '../PageHeader';
import type { PropsFromComponent } from '../types';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { ErrorMessage } from '../errors/ErrorMessage';
import { Tabs } from './Tabs';

// Unfortunately backstage do not export the props type for <Content />
type ContentProps = PropsFromComponent<typeof Content>;

type ParodosPageProps = ContentProps;

export const ParodosPage: FC<ParodosPageProps> = ({ children, ...props }) => {
  const error = useStore(state => state.error());

  return (
    <Page themeId="tool">
      <PageHeader />
      <Tabs />
      <Content {...props}>
        {error && <ErrorMessage error={error as Error} />}
        {children}
      </Content>
    </Page>
  );
};
