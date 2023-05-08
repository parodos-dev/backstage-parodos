import React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';

export function AccordionIcon(props: SvgIconProps): JSX.Element {
  return (
    <SvgIcon fill="none" {...props} viewBox="0 0 10 18">
      <path
        d="M4.99991 2.83L8.16991 6L9.57991 4.59L4.99991 0L0.409912 4.59L1.82991 6L4.99991 2.83ZM4.99991 15.17L1.82991 12L0.419912 13.41L4.99991 18L9.58991 13.41L8.16991 12L4.99991 15.17Z"
        fill="#1976D2"
      />
    </SvgIcon>
  );
}
