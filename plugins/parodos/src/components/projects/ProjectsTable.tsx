import React, { useMemo, useRef, useState } from 'react';
import { LinkButton, Table, TableColumn } from '@backstage/core-components';
import FilterListIcon from '@material-ui/icons/FilterList';
import {
  ClickAwayListener,
  Grid,
  Grow,
  IconButton,
  Link,
  makeStyles,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  TableCell,
  Typography,
} from '@material-ui/core';
import { AccessRole, Project } from '../../models/project';
import { getHumanReadableDate } from '../converters';
import { pluginRoutePrefix } from '../ParodosPage/navigationMap';
import { NavLink } from 'react-router-dom';
import { UserGroupIcon } from '../icons/UserGroupIcon';

const useStyles = makeStyles(_ => ({
  manageAccessIcon: {
    marginLeft: 'auto',
  },
}));

type ProjectsTableData = {
  [K in Pick<Project, 'name' | 'createdBy' | 'createdDate' | 'accessRole'> &
    string]: string;
};

const columns: TableColumn<ProjectsTableData>[] = [
  { title: 'PROJECT NAME', field: 'name', width: '20%' },
  { title: 'OWNER', field: 'createdBy', width: '10%' },
  { title: 'CREATED', field: 'createdDate', width: '10%' },
  { title: 'ACCESS', field: 'accessRole', width: '10%' },
  { title: '', field: 'view', width: '5%' },
];

type AccessRoleFilter = AccessRole | 'All';

const accessRoleMap: Record<AccessRoleFilter, string> = {
  All: 'All',
  Admin: 'Admin',
  Owner: 'Owner',
  Developer: 'Developer',
} as const;

type AccessRoleMapKeys = keyof typeof accessRoleMap;

export function ProjectsTable({ projects }: { projects: Project[] }) {
  const classes = useStyles();
  const filterIconRef = useRef<HTMLButtonElement>(null);
  const [openFilter, setOpenFilter] = useState(false);
  const handleFilterToggle = () => setOpenFilter(prevOpen => !prevOpen);
  const handleFilterClose = (event: React.MouseEvent<Node, MouseEvent>) => {
    if (filterIconRef.current?.contains(event.target as Node)) {
      return;
    }

    setOpenFilter(false);
  };
  const [search, setSearch] = useState('');
  const [accessRoleFilter, setAccessRoleFilter] =
    useState<AccessRoleFilter>('All');

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpenFilter(false);
    }
  };

  const handleChangeFilter = (
    event: React.MouseEvent<Node, MouseEvent>,
    filter: AccessRoleFilter,
  ) => {
    handleFilterClose(event);
    setAccessRoleFilter(filter);
  };

  const tableData = useMemo(
    () =>
      projects
        .filter(p =>
          accessRoleFilter === 'All' ? true : p.accessRole === accessRoleFilter,
        )
        .filter(p =>
          search ? p.name.toLocaleLowerCase().includes(search) : true,
        )
        .map(project => ({
          id: project.id,
          name: project.name,
          createdBy: project.createdBy,
          createdDate: getHumanReadableDate(project.createdDate),
          accessRole: project.accessRole,
        })),
    [accessRoleFilter, projects, search],
  );

  return (
    <Table
      title={
        <span>
          <IconButton ref={filterIconRef} onClick={handleFilterToggle}>
            <FilterListIcon />
          </IconButton>
          <Typography display="inline" variant="h6">
            Filters
          </Typography>
          <Popper
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
                      {(Object.keys(accessRoleMap) as AccessRoleMapKeys[]).map(
                        accessRole => (
                          <MenuItem
                            key={accessRole}
                            onClick={e => handleChangeFilter(e, accessRole)}
                          >
                            {accessRoleMap[accessRole]}
                          </MenuItem>
                        ),
                      )}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </span>
      }
      onSearchChange={setSearch}
      options={{ paging: false }}
      columns={columns}
      data={tableData}
      components={{
        Cell: ({ columnDef, rowData }) => {
          if (columnDef.field === 'accessRole') {
            return rowData.accessRole ? (
              <TableCell>
                <Grid container alignItems="center">
                  <Grid item>{rowData.accessRole}</Grid>
                  <Grid item className={classes.manageAccessIcon}>
                    <Link
                      to={`${pluginRoutePrefix}/projects/${rowData.id}/access`}
                      component={NavLink}
                    >
                      <IconButton
                        ref={filterIconRef}
                        onClick={handleFilterToggle}
                      >
                        <UserGroupIcon color="primary" />
                      </IconButton>
                    </Link>
                  </Grid>
                </Grid>
              </TableCell>
            ) : (
              <TableCell>
                <LinkButton color="primary" to="#">
                  Request Access
                </LinkButton>
              </TableCell>
            );
          } else if (columnDef.field === 'view') {
            return (
              <TableCell>
                {rowData.accessRole && (
                  <LinkButton
                    color="primary"
                    to={`${pluginRoutePrefix}/workflows?project=${rowData.id}`}
                  >
                    VIEW
                  </LinkButton>
                )}
              </TableCell>
            );
          }
          return <TableCell>{rowData[columnDef.field]}</TableCell>;
        },
      }}
    />
  );
}
