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
  TableRow,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  searchInput: {
    marginLeft: 'auto',
    alignSelf: 'flex-end',
  },
  filterHeader: {
    marginLeft: theme.spacing(2),
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
    '&&': {
      margin: '0',
      minHeight: '60px',
    },
  },
  workflowDescriptionSummaryExpanded: {},
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
  restartedWorkflow: {
    paddingLeft: theme.spacing(7.5),
  },
}));

interface WorkflowTableData {
  index: number;
  id: string;
  originalExecutionId?: string;
  name: string;
  description?: string;
  type: string;
  processingType: 'SEQUENTIAL' | 'PARALLEL';
  StatusComponent: (props: { retries?: number }) => JSX.Element;
  author: string;
  startDate: string;
  endDate: string;
  status: ProjectWorkflow['workStatus'];
  restarts: WorkflowTableData[];
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
  (props: { retries?: number }) => JSX.Element
> = {
  IN_PROGRESS: ({ retries = 0 }) => (
    <StatusRunning>Running{retries > 0 ? ` (${retries})` : ''}</StatusRunning>
  ),
  COMPLETED: ({ retries = 0 }) => (
    <StatusOK>Completed{retries > 0 ? ` (${retries})` : ''}</StatusOK>
  ),
  FAILED: ({ retries = 0 }) => (
    <StatusError>Failed{retries > 0 ? ` (${retries})` : ''}</StatusError>
  ),
  PENDING: ({ retries = 0 }) => (
    <StatusWarning>Pending{retries > 0 ? ` (${retries})` : ''}</StatusWarning>
  ),
  REJECTED: ({ retries = 0 }) => (
    <StatusAborted>Aborted{retries > 0 ? ` (${retries})` : ''}</StatusAborted>
  ),
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
  const [expandedRows, setExpandedRows] = useState<Map<number, boolean>>(
    new Map(),
  );

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

  const filteredWorkflows = workflows
    .filter(workflow =>
      statusFilter ? workflow.workStatus === statusFilter : true,
    )
    .filter(workflow =>
      search
        ? workflow.workFlowName.toLowerCase().includes(search.toLowerCase())
        : true,
    );

  const workflowMap: Map<string, WorkflowTableData> = new Map();

  filteredWorkflows.forEach((workflow, index) => {
    const definition = getWorkDefinitionBy('byName', workflow.workFlowName);

    workflowMap.set(workflow.workFlowExecutionId, {
      index,
      id: workflow.workFlowExecutionId,
      originalExecutionId: workflow.originalExecutionId,
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
      workFlowType: workflow.workFlowType,
      status: workflow.workStatus,
      restarts: [],
    } as WorkflowTableData);
  });

  for (const workflow of workflowMap.values()) {
    let parentWorkflow = workflow.originalExecutionId
      ? workflowMap.get(workflow.originalExecutionId)
      : undefined;
    while (parentWorkflow?.originalExecutionId) {
      parentWorkflow = workflowMap.get(parentWorkflow.originalExecutionId);
    }
    if (parentWorkflow) {
      parentWorkflow.restarts.push(workflow);
    }
  }

  const data = Array.from(workflowMap.values()).filter(
    workflow => !workflow.originalExecutionId,
  );

  const handleExpand = (rowIndex: number) => {
    setExpandedRows(prevExpandedRows =>
      new Map(prevExpandedRows).set(rowIndex, !prevExpandedRows.get(rowIndex)),
    );
  };

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
        Row: ({ columns: columnDefs, components: { Cell }, data: rowData }) => {
          return (
            <>
              <TableRow key={rowData.index}>
                {columnDefs.map((column: TableColumn<WorkflowTableData>) => (
                  <Cell
                    key={column.field}
                    columnDef={column}
                    rowData={rowData}
                  />
                ))}
              </TableRow>
              {expandedRows.get(rowData.index) &&
                rowData.restarts.map((restart: WorkflowTableData) => (
                  <TableRow key={`${rowData.index}-${restart.index}`}>
                    {columnDefs.map(
                      (column: TableColumn<WorkflowTableData>) => (
                        <Cell
                          key={column.field}
                          columnDef={column}
                          rowData={restart}
                        />
                      ),
                    )}
                  </TableRow>
                ))}
            </>
          );
        },
        Cell: ({ columnDef, rowData: { StatusComponent, ...rowData } }) => {
          if (columnDef.field === 'name') {
            return (
              <TableCell
                width={columnDef.width}
                className={
                  rowData.originalExecutionId
                    ? classes.restartedWorkflow
                    : undefined
                }
              >
                {rowData?.additionalInfos?.length || rowData.restarts.length ? (
                  <Accordion
                    className={classes.workflowDescriptionContainer}
                    expanded={expandedRows.get(rowData.index)}
                    onChange={() => handleExpand(rowData.index)}
                  >
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
                        value={
                          rowData.restarts.length
                            ? `${rowData.name} (${rowData.restarts.length})`
                            : rowData.name
                        }
                        subvalue={rowData.description}
                      />
                    </AccordionSummary>
                    {rowData?.additionalInfos && (
                      <AccordionDetails
                        className={classes.workflowDescriptionDetails}
                      >
                        {rowData?.additionalInfos?.map(
                          (additionalInfo: any) => {
                            return (
                              <Link target="_blank" href={additionalInfo.value}>
                                {additionalInfo.key}{' '}
                                <LaunchIcon
                                  fontSize="inherit"
                                  className={classes.urlIcon}
                                />
                              </Link>
                            );
                          },
                        )}
                      </AccordionDetails>
                    )}
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
              <TableCell width={columnDef.width}>
                <LinkButton
                  color="primary"
                  to={`${pluginRoutePrefix}/onboarding/${projectId}/${
                    rowData.id
                  }/workflow-detail${
                    rowData.workFlowType === 'ASSESSMENT'
                      ? `?assessmentexecutionid=${rowData.id}`
                      : ''
                  }`}
                >
                  {rowData.status === 'FAILED' ? 'SUMMARY' : 'VIEW'}
                </LinkButton>
              </TableCell>
            );
          } else if (columnDef.field === 'status') {
            return (
              <TableCell
                data-testid={`${rowData.id} '${rowData.status}'`}
                width={columnDef.width}
              >
                <StatusComponent retries={rowData.restarts.length} />
              </TableCell>
            );
          }
          return (
            <TableCell width={columnDef.width}>
              {rowData[columnDef.field]}
            </TableCell>
          );
        },
      }}
    />
  );
};
