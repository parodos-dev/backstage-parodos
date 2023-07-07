import { makeStyles } from '@material-ui/core';

export const useCommonStyles = makeStyles(theme => ({
  center: {
    'text-align': 'center',
  },
  inlineicon: {
    'vertical-align': 'bottom',
  },
  centericon: {
    'margin-left': '50%',
  },
  floatright: {
    float: 'right',
  },
  paddingtop1: {
    'padding-top': '1rem !important',
  },
  margintop1: {
    'margin-top': '1rem !important',
  },
  fullHeight: {
    height: '100%',
  },
  link: {
    color: theme.palette.primary.main,
  },
  svgCard: {
    height: '100%',
    '& div[class^="MuiCardContent-root"]': {
      display: 'flex',
      flexDirection: 'column',
    },
  },
}));
