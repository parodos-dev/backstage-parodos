import React, { ComponentPropsWithoutRef } from 'react';
import {
  Checkbox,
  List,
  ListItem,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { Components } from 'react-markdown';
import { Link } from '@backstage/core-components';

const useStyles = makeStyles(theme => ({
  p: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  strong: {
    fontWeight: theme.typography.fontWeightBold as number,
  },
  em: {
    fontStyle: 'italic',
  },
  ol: {
    listStyleType: 'decimal',
    '& &': {
      listStyleType: 'lower-alpha',
      paddingLeft: theme.spacing(2),
    },
  },
  ul: {
    listStyleType: 'disc',
    '& &': {
      listStyleType: 'circle',
      paddingLeft: theme.spacing(2),
    },
  },
  li: {
    display: 'list-item',
    padding: `${theme.spacing(0.5)}px 0`,
    '&.task-list-item': {
      listStyleType: 'none',
    },
  },
  code: {
    padding: `${theme.spacing(0.25)}px ${theme.spacing(0.5)}px`,
    backgroundColor: theme.palette.background.default,
  },
  blockquote: {
    borderLeft: `4px solid ${theme.palette.divider}`,
    padding: `0 ${theme.spacing(1)}px`,
    marginBottom: theme.spacing(1),
    '& > p': {
      padding: 0,
    },
  },
  table: {
    marginBottom: theme.spacing(1),
  },
  pre: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1),
  },
  checkbox: {
    padding: 0,
  },
}));

const P = (props: ComponentPropsWithoutRef<'p'>) => {
  const classes = useStyles();
  return (
    <Typography
      className={classes.p}
      variant="body1"
      children={props.children}
    />
  );
};

const Strong = (props: ComponentPropsWithoutRef<'strong'>) => {
  const classes = useStyles();
  return (
    <Typography
      className={classes.strong}
      variant="body1"
      component="strong"
      children={props.children}
    />
  );
};

const Em = (props: ComponentPropsWithoutRef<'em'>) => {
  const classes = useStyles();
  return (
    <Typography
      className={classes.em}
      variant="body1"
      component="em"
      children={props.children}
    />
  );
};

const Ol = (props: ComponentPropsWithoutRef<'ol'>) => {
  const classes = useStyles();
  return (
    <List className={classes.ol} component="ol" children={props.children} />
  );
};

const Ul = (props: ComponentPropsWithoutRef<'ul'>) => {
  const classes = useStyles();
  return (
    <List className={classes.ul} component="ul" children={props.children} />
  );
};

const Li = (props: ComponentPropsWithoutRef<'li'>) => {
  const classes = useStyles();
  return (
    <ListItem
      className={`${classes.li} ${props.className}`}
      children={props.children}
    />
  );
};

const Code = (props: ComponentPropsWithoutRef<'code'>) => {
  const classes = useStyles();
  return (
    <Typography
      className={classes.code}
      variant="body1"
      component="code"
      children={props.children}
    />
  );
};

const Blockquote = (props: ComponentPropsWithoutRef<'blockquote'>) => {
  const classes = useStyles();
  return (
    <Typography
      className={classes.blockquote}
      variant="body1"
      component="blockquote"
      children={props.children}
    />
  );
};

const StyledTable = (props: ComponentPropsWithoutRef<'table'>) => {
  const classes = useStyles();
  return <Table className={classes.table} children={props.children} />;
};

const Pre = (props: ComponentPropsWithoutRef<'pre'>) => {
  const classes = useStyles();
  return (
    <Typography
      className={classes.pre}
      variant="body1"
      component="pre"
      children={props.children}
    />
  );
};

const StyledCheckbox = (props: ComponentPropsWithoutRef<'input'>) => {
  const classes = useStyles();
  return (
    <Checkbox
      className={classes.checkbox}
      disabled={props.disabled}
      checked={props.checked}
    />
  );
};

export const renderers: Components = {
  h1: props => <Typography variant="h1" children={props.children} />,
  h2: props => <Typography variant="h2" children={props.children} />,
  h3: props => <Typography variant="h3" children={props.children} />,
  h4: props => <Typography variant="h4" children={props.children} />,
  h5: props => <Typography variant="h5" children={props.children} />,
  h6: props => <Typography variant="h6" children={props.children} />,
  p: P,
  strong: Strong,
  em: Em,
  ol: Ol,
  ul: Ul,
  li: Li,
  code: Code,
  a: props => <Link to={props.href as string} children={props.children} />,
  blockquote: Blockquote,
  table: StyledTable,
  thead: props => <TableHead children={props.children} />,
  tbody: props => <TableBody children={props.children} />,
  tr: props => <TableRow children={props.children} />,
  th: props => <TableCell children={props.children} />,
  td: props => <TableCell children={props.children} />,
  pre: Pre,
  input: props => {
    if (props.type === 'checkbox') {
      return (
        <StyledCheckbox disabled={props.disabled} checked={props.checked} />
      );
    }
    return null;
  },
};
