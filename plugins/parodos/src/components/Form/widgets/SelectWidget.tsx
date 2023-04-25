import React from 'react';
import { WidgetProps } from '@rjsf/utils';
import { widgets } from './widgets';

export function SelectWidget(props: WidgetProps) {
  return <widgets.SelectWidget {...props} variant="outlined" />;
}
