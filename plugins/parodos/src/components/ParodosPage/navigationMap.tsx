import React from 'react';
import { AssessmentIcon, NotificationIcon } from '../icons';

export const pluginRoutePrefix = '/parodos';

export const navigationMap = [
  { label: 'Projects', route: '/projects', icon: <AssessmentIcon /> },
  { label: 'Workflows', route: '/workflows', icon: <AssessmentIcon /> },
  {
    label: 'Notification',
    route: '/notification',
    icon: <NotificationIcon />,
  },
] as const;
