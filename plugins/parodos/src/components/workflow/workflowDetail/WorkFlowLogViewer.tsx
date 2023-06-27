import { InfoCard, LogViewer } from '@backstage/core-components';
import React from 'react';

export const WorkFlowLogViewer = ({ log }: { log: string }) => (
  <InfoCard>
    <LogViewer text={log} />
  </InfoCard>
);
