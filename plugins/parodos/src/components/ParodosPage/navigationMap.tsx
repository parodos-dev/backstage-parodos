import React from 'react';
import { AssessmentIcon, NotificationIcon } from '../icons';

export const pluginRoutePrefix = '/parodos';

export const navigationMap = [
  { label: 'Projects', routes: ['/projects'], icon: <AssessmentIcon /> },
  { label: 'Workflows', routes: ['/workflows'], icon: <AssessmentIcon /> },
  {
    label: 'Assessment',
    routes: ['/onboarding/'],
    icon: <AssessmentIcon />,
  },

  {
    label: 'Notification',
    routes: ['/notification'],
    icon: <NotificationIcon />,
  },
];
