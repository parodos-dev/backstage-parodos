import React, { useRef, useState } from 'react';
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

interface WorkflowTableData {
  id: string;
  name: string;
  type: string;
  processingType: 'SEQUENTIAL' | 'PARALLEL';
  status: string;
  author: string;
  startDate: string;
  endDate: string;
}

const columns: TableColumn<WorkflowTableData>[] = [
  { title: 'Name', field: 'name', id: 'column-workflow-name', width: '20%' },
  { title: 'Status', field: 'status', width: '10%' },
  { title: 'initiated by', field: 'author', width: '10%' },
  { title: 'Started', field: 'startDate', width: '10%' },
  { title: 'Ended', field: 'endDate', width: '10%' },
  { title: '', field: 'view', width: '5%' },
];

const statusMap: Record<ProjectWorkflow['workStatus'], string> = {
  IN_PROGRESS: 'Running',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  PENDING: 'Pending',
  REJECTED: 'Aborted',
  EXTERNAL_INPUT_REQUIRED: 'Running',
};

const statusColorMap: Record<ProjectWorkflow['workStatus'], string> = {
  IN_PROGRESS: 'runningStatus',
  COMPLETED: 'completedStatus',
  FAILED: 'failedStatus',
  PENDING: 'pendingStatus',
  REJECTED: 'abortedStatus',
  EXTERNAL_INPUT_REQUIRED: 'runningStatus',
};

const formatDate = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export const WorkflowsTable: React.FC<{
  projectId: string;
  workflows: ProjectWorkflow[];
}> = ({ projectId, workflows }) => {
  const filterIconRef = useRef<HTMLButtonElement>(null);
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<ProjectWorkflow['workStatus']>();
  const [openFilter, setOpenFilter] = useState(false);
  const getWorkDefinitionBy = useStore(state => state.getWorkDefinitionBy);

  const handleFilterToggle = () => setOpenFilter(prevOpen => !prevOpen);
  const handleFilterClose = (event: React.MouseEvent<Node, MouseEvent>) => {
    if (
      filterIconRef.current &&
      filterIconRef.current.contains(event.target as Node)
    ) {
      return;
    }

    setOpenFilter(false);
  };
  const handleChangeFilter = (
    event: React.MouseEvent<Node, MouseEvent>,
    filter?: ProjectWorkflow['workStatus'],
  ) => {
    handleFilterClose(event);
    setStatusFilter(filter);
  };

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpenFilter(false);
    }
  };

  const data = workflows
    .filter(workflow =>
      statusFilter ? workflow.workStatus === statusFilter : true,
    )
    .map(workflow => {
      const definition = getWorkDefinitionBy('byName', workflow.workFlowName);

      return {
        id: workflow.workFlowExecutionId,
        name: workflow.workFlowName,
        type: definition?.type,
        processingType: definition?.processingType,
        status: statusMap[workflow.workStatus],
        statusColor: statusColorMap[workflow.workStatus],
        author: workflow.executeBy,
        startDate: formatDate.format(Date.parse(workflow.startDate)),
        endDate: workflow.endDate
          ? formatDate.format(Date.parse(workflow.endDate))
          : undefined,
      } as WorkflowTableData;
    })
    .filter(workflow =>
      search
        ? workflow.name.toLowerCase().includes(search.toLowerCase())
        : true,
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
          </Popper>
        </span>
      }
      onSearchChange={setSearch}
      options={{ paging: false }}
      columns={columns}
      data={data}
      components={{
        Cell: ({ columnDef, rowData }) => {
          if (columnDef.field === 'view') {
            return (
              <TableCell>
                <LinkButton
                  color="primary"
                  to={`${pluginRoutePrefix}/onboarding/${projectId}/${rowData.id}/workflow-detail`}
                >
                  VIEW
                </LinkButton>
              </TableCell>
            );
          } else if (columnDef.field === 'status') {
            return (
              <TableCell data-testid={`${rowData.id} '${rowData.status}'`}>
                <div
                  className={`${classes.filterIcon} ${
                    classes[rowData.statusColor as keyof typeof classes]
                  }`}
                />
                {rowData.status}
              </TableCell>
            );
          }
          return <TableCell>{rowData[columnDef.field]}</TableCell>;
        },
      }}
    />
  );
};
