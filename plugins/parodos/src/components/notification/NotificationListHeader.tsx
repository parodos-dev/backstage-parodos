import React from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { AccordionIcon } from '../icons/AccordionIcon';
import { Select } from '@backstage/core-components';
import { type PropsFromComponent } from '../types';
import ArchiveIcon from '@material-ui/icons/Archive';

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
  accordionIcon: {
    flexBasis: '4%',
    position: 'relative',
    top: '0.75rem',
  },
  selected: {
    marginLeft: theme.spacing(2),
  },
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
      <Grid item xs={1} className={styles.accordionIcon}>
        {view === 'Filter' ? (
          <span>
            <AccordionIcon />
          </span>
        ) : (
          <span>
            <ArchiveIcon />
          </span>
        )}
      </Grid>
    </Grid>
  );
}
