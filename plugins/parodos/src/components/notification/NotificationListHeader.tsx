import React from 'react';
import { Grid, IconButton, makeStyles, Typography } from '@material-ui/core';
import { AccordionIcon } from '../icons/AccordionIcon';
import { Select } from '@backstage/core-components';
import { type PropsFromComponent } from '../types';
import ArchiveIcon from '@material-ui/icons/Archive';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import cs from 'classnames';

type SelectProps = PropsFromComponent<typeof Select>;

type View = 'Filter' | 'Actions';

interface NotificationListHeaderProps {
  filterChangeHandler: SelectProps['onChange'];
  filter: SelectProps['selected'];
  selected: number;
}

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: theme.spacing(12),
  },
  selected: {
    marginLeft: theme.spacing(2),
    color: '#E20074',
    position: 'relative',
    top: '0.75rem',
  },
  actions: {
    position: 'relative',
    top: '0.75rem',
    display: 'flex',
    justifyContent: 'flex-end',
    marginRight: theme.spacing(1)
  },
  accordionIcon: {
    top: '1rem',
  },
  buttons: {
    display: 'flex'
  }
}));

export function NotificationListHeader({
  filterChangeHandler,
  filter,
  selected,
}: NotificationListHeaderProps): JSX.Element {
  const styles = useStyles();
  const view: View = selected === 0 ? 'Filter' : 'Actions';

  return (
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      className={styles.root}
    >
      <Grid item xs={3}>
        {view === 'Filter' ? (
          <Select
            onChange={filterChangeHandler}
            selected={filter}
            label="Filter by"
            items={[
              { label: 'All', value: 'ALL' },
              { label: 'Unread', value: 'UNREAD' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
          />
        ) : (
          <Typography className={styles.selected}>
            {selected} selected
          </Typography>
        )}
      </Grid>
      <Grid
        item
        xs={1}
        className={cs(styles.actions, {
          [styles.accordionIcon]: view === 'Filter',
        })}
      >
        {view === 'Filter' ? (
          <span>
            <AccordionIcon />
          </span>
        ) : (
          <span className={styles.buttons}>
            <IconButton aria-label="archive">
              <ArchiveIcon />
            </IconButton>
            <IconButton size="medium" aria-label="delete" edge="end">
              <DeleteIcon />
            </IconButton>
          </span>
        )}
      </Grid>
    </Grid>
  );
}
