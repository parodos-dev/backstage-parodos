import React, { useRef, useState } from 'react';
import {
  LinkButton,
  Table,
  TableColumn,
  StatusRunning,
  StatusOK,
  StatusError,
  StatusWarning,
  StatusAborted,
  SubvalueCell,
} from '@backstage/core-components';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FilterListIcon from '@material-ui/icons/FilterList';
import LaunchIcon from '@material-ui/icons/Launch';
import { pluginRoutePrefix } from '../ParodosPage/navigationMap';
import { ProjectWorkflow } from '../../models/workflowTaskSchema';
import { useStore } from '../../stores/workflowStore/workflowStore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  Link,
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
  workflowDescriptionContainer: {
    background: 'inherit',
    padding: '0',
    boxShadow: 'none',
  },
  workflowDescriptionSummary: {
    flexDirection: 'row-reverse',
    padding: '0',
  },
  workflowDescriptionSummaryContent: {
    flexDirection: 'column',
  },
  expandIcon: {
    marginRight: theme.spacing(2),
    padding: '0',
  },
  urlIcon: {
    color: theme.palette.primary.dark,
  },
  workflowDescriptionDetails: {
    flexDirection: 'column',
    marginLeft: theme.spacing(3),
    gap: theme.spacing(0.5),
  },
}));

interface WorkflowTableData {
  id: string;
  name: string;
  description?: string;
  type: string;
  processingType: 'SEQUENTIAL' | 'PARALLEL';
  StatusComponent: () => JSX.Element;
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

const statuses: ProjectWorkflow['workStatus'][] = [
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'PENDING',
  'REJECTED',
];

const statusMap: Record<ProjectWorkflow['workStatus'], string> = {
  IN_PROGRESS: 'Running',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  PENDING: 'Pending',
  REJECTED: 'Aborted',
};

const StatusComponents: Record<
  ProjectWorkflow['workStatus'],
  () => JSX.Element
> = {
  IN_PROGRESS: () => <StatusRunning>Running</StatusRunning>,
  COMPLETED: () => <StatusOK>Completed</StatusOK>,
  FAILED: () => <StatusError>Failed</StatusError>,
  PENDING: () => <StatusWarning>Pending</StatusWarning>,
  REJECTED: () => <StatusAborted>Aborted</StatusAborted>,
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
        description: 'Description of workflow',
        type: definition?.type,
        processingType: definition?.processingType,
        StatusComponent: StatusComponents[workflow.workStatus],
        author: workflow.executeBy,
        startDate: formatDate.format(Date.parse(workflow.startDate)),
        endDate: workflow.endDate
          ? formatDate.format(Date.parse(workflow.endDate))
          : undefined,
        additionalInfos: workflow.additionalInfos,
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
                      {statuses.map(status => (
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
        Cell: ({ columnDef, rowData: { StatusComponent, ...rowData } }) => {
          if (columnDef.field === 'name') {
            return (
              <TableCell>
                {rowData?.additionalInfos?.length ? (
                  <Accordion className={classes.workflowDescriptionContainer}>
                    <AccordionSummary
                      className={classes.workflowDescriptionSummary}
                      classes={{
                        content: classes.workflowDescriptionSummaryContent,
                      }}
                      IconButtonProps={{
                        classes: { edgeEnd: classes.expandIcon },
                      }}
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="workflow-description-content"
                      id="workflow-description-header"
                    >
                      <SubvalueCell
                        value={rowData.name}
                        subvalue={rowData.description}
                      />
                    </AccordionSummary>
                    <AccordionDetails
                      className={classes.workflowDescriptionDetails}
                    >
                      {rowData?.additionalInfos?.map((additionalInfo: any) => {
                        return (
                          <Link target="_blank" href={additionalInfo.value}>
                            {additionalInfo.key}{' '}
                            <LaunchIcon
                              fontSize="inherit"
                              className={classes.urlIcon}
                            />
                          </Link>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  <SubvalueCell
                    value={rowData.name}
                    subvalue={rowData.description}
                  />
                )}
              </TableCell>
            );
          } else if (columnDef.field === 'view') {
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
                <StatusComponent />
              </TableCell>
            );
          }
          return <TableCell>{rowData[columnDef.field]}</TableCell>;
        },
      }}
    />
  );
};
