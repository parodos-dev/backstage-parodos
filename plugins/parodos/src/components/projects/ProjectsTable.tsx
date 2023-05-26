import React, { useMemo, useRef, useState } from 'react';
import { LinkButton, Table, TableColumn } from '@backstage/core-components';
import FilterListIcon from '@material-ui/icons/FilterList';
import { pluginRoutePrefix } from '../ParodosPage/navigationMap';
import { ProjectWorkflow } from '../../models/workflowTaskSchema';
import { useStore } from '../../stores/workflowStore/workflowStore';
import {
  ClickAwayListener,
  Grow,
  IconButton,
  makeStyles,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  TableCell,
  Typography,
} from '@material-ui/core';
import { Project } from '../../models/project';
import cs from 'classnames';
import { getHumanReadableDate } from '../converters';

const useStyles = makeStyles(theme => ({
  searchInput: {
    marginLeft: 'auto',
    alignSelf: 'flex-end',
  },
  filterHeader: {
    marginLeft: '16px',
  },
  filterIcon: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  runningStatus: {
    backgroundColor: theme.palette.info.main,
  },
  completedStatus: {
    backgroundColor: theme.palette.success.main,
  },
  failedStatus: {
    backgroundColor: theme.palette.error.main,
  },
  pendingStatus: {
    backgroundColor: theme.palette.warning.main,
  },
  abortedStatus: {
    backgroundColor: theme.palette.grey[500],
  },
}));

type ProjectsTableData = Pick<
  Project,
  'name' | 'createdBy' | 'createdDate' | 'accessRole'
>;

const columns: TableColumn<ProjectsTableData>[] = [
  { title: 'PROJECT NAME', field: 'name', width: '20%' },
  { title: 'OWNER', field: 'createdBy', width: '10%' },
  { title: 'CREATED', field: 'createdDate', width: '10%' },
  { title: 'ACCESS', field: 'accessRole', width: '10%' },
  { title: '', field: 'view', width: '5%' },
];

const formatDate = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const classes = useStyles();
  const filterIconRef = useRef<HTMLButtonElement>(null);
  const [openFilter, setOpenFilter] = useState(false);
  const handleFilterToggle = () => setOpenFilter(prevOpen => !prevOpen);
  // const handleFilterClose = () => setOpenFilter(false)

  const tableData = useMemo(
    () =>
      projects.map(project => ({
        id: project.id,
        name: project.name,
        createdBy: project.createdBy,
        createdDate: getHumanReadableDate(project.createdDate),
        accessRole: project.accessRole,
      })),
    [projects],
  );

  return (
    <Table
      title={
        <span>
          <IconButton ref={filterIconRef} onClick={handleFilterToggle}>
            <FilterListIcon />
          </IconButton>
          <Typography
            className={classes.filterHeader}
            display="inline"
            variant="h6"
          >
            Filters
          </Typography>
          {/* <Popper
            open={openFilter}
            anchorEl={filterIconRef.current}
            role={undefined}
            transition
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === 'bottom' ? 'center top' : 'center bottom',
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleFilterClose}>
                    <MenuList
                      autoFocusItem={openFilter}
                      id="status-filter-list"
                      onKeyDown={handleListKeyDown}
                    >
                      <MenuItem onClick={handleChangeFilter}>All</MenuItem>
                      {(
                        Object.keys(
                          statusMap,
                        ) as ProjectWorkflow['workStatus'][]
                      ).map(status => (
                        <MenuItem
                          key={status}
                          onClick={e => handleChangeFilter(e, status)}
                        >
                          {statusMap[status]}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper> */}
        </span>
      }
      // onSearchChange={setSearch}
      options={{ paging: false }}
      columns={columns}
      data={tableData}
      components={{
        Cell: ({ columnDef, rowData }) => {
          if (columnDef.field === 'view') {
            return (
              <TableCell>
                <LinkButton color="primary" to="/workflows">
                  VIEW
                </LinkButton>
              </TableCell>
            );
          }
          return <TableCell>{rowData[columnDef.field]}</TableCell>;
        },
      }}
    />
  );
}
