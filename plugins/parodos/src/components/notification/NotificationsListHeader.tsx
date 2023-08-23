import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  debounce,
  Grid,
  IconButton,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import { AccordionIcon } from '../icons/AccordionIcon';
import { Progress, Select } from '@backstage/core-components';
import { type PropsFromComponent } from '../types';
import ArchiveIcon from '@material-ui/icons/Archive';
import UnarchiveIcon from '@material-ui/icons/Unarchive';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import cs from 'classnames';

type SelectProps = PropsFromComponent<typeof Select>;
type TextFieldProps = PropsFromComponent<typeof TextField>;

type View = 'Filter' | 'Actions';

interface NotificationListHeaderProps {
  filterChangeHandler: SelectProps['onChange'];
  filter: SelectProps['selected'];
  searchChangeHandler: TextFieldProps['onChange'];
  search: TextFieldProps['value'];
  selected: number;
  deleteHandler: MouseEventHandler<HTMLButtonElement>;
  archiveHandler: MouseEventHandler<HTMLButtonElement>;
  unarchiveHandler: MouseEventHandler<HTMLButtonElement>;
  disableButtons?: boolean;
}

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: theme.spacing(12),
    '&.actions': {
      backgroundColor: theme.palette.background.default,
    },
  },
  selected: {
    marginLeft: theme.spacing(2),
    color: theme.palette.error.main,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginRight: theme.spacing(1),
  },
  accordionIcon: {
    top: theme.spacing(2),
  },
  buttons: {
    display: 'flex',
  },
  filterIcon: {
    color: theme.palette.primary.main,
  },
  progress: {
    position: 'relative',
    top: theme.spacing(1),
    height: theme.spacing(0.5),
  },
}));

export function NotificationListHeader({
  filterChangeHandler,
  filter,
  searchChangeHandler,
  search,
  selected,
  deleteHandler,
  archiveHandler,
  unarchiveHandler,
  disableButtons,
}: NotificationListHeaderProps): JSX.Element {
  const styles = useStyles();
  const view: View = selected === 0 ? 'Filter' : 'Actions';

  const [searchValue, setSearchValue] = useState(search);

  const debouncedSearchHandler = useMemo(
    () => searchChangeHandler && debounce(searchChangeHandler, 500),
    [searchChangeHandler],
  );
  const isLoading = searchValue !== search;

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(event.target.value);
      debouncedSearchHandler?.(event);
    },
    [debouncedSearchHandler],
  );

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  return (
    <>
      <Grid
        container
        justifyContent="space-between"
        alignItems="flex-end"
        className={cs(styles.root, view === 'Actions' && 'actions')}
      >
        {view === 'Filter' ? (
          <>
            <Grid item xs={3}>
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
            </Grid>
            <Grid item xs={3}>
              <TextField
                placeholder="Search"
                label="Search"
                variant="outlined"
                size="small"
                fullWidth
                onChange={handleSearchChange}
                value={searchValue}
              />
            </Grid>
          </>
        ) : (
          <Grid item xs={3}>
            <Typography className={styles.selected}>
              {selected} selected
            </Typography>
          </Grid>
        )}
        <Grid
          item
          xs={1}
          className={cs(styles.actions, {
            [styles.accordionIcon]: view === 'Filter',
          })}
        >
          {view === 'Filter' ? (
            <span className={styles.filterIcon}>
              <AccordionIcon />
            </span>
          ) : (
            <span className={styles.buttons}>
              {filter !== 'ARCHIVED' && (
                <IconButton
                  aria-label="archive"
                  onClick={archiveHandler}
                  disabled={disableButtons}
                >
                  <ArchiveIcon />
                </IconButton>
              )}
              {filter !== 'UNREAD' && (
                <IconButton
                  aria-label="unarchive"
                  onClick={unarchiveHandler}
                  disabled={disableButtons}
                >
                  <UnarchiveIcon />
                </IconButton>
              )}
              <IconButton
                onClick={deleteHandler}
                aria-label="delete"
                edge="end"
                disabled={disableButtons}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          )}
        </Grid>
      </Grid>
      <div className={styles.progress}>{isLoading && <Progress />}</div>
    </>
  );
}
