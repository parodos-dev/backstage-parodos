import React, { useState } from 'react';
import { LinkButton, Table, TableColumn } from '@backstage/core-components';
import FilterListIcon from '@material-ui/icons/FilterList';
import { pluginRoutePrefix } from '../ParodosPage/navigationMap';
import { ProjectWorkflow } from '../../models/workflowTaskSchema';
import { useStore } from '../../stores/workflowStore/workflowStore';
import {
  IconButton,
  makeStyles,
  TableCell,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles(_theme => ({
  searchInput: {
    marginLeft: 'auto',
    alignSelf: 'flex-end',
  },
  filterHeader: {
    marginLeft: '16px',
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
  { title: 'Name', field: 'name', id: 'column-workflow-name' },
  { title: 'Type', field: 'type' },
  { title: 'Status', field: 'status' },
  { title: 'Author', field: 'author' },
  { title: 'Started', field: 'startDate' },
  { title: 'Ended', field: 'endDate' },
  { title: 'View', field: 'view' },
];

const statusMap: Record<ProjectWorkflow['workStatus'], string> = {
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  IN_PROGRESS: 'Running',
  PENDING: 'Pending',
  REJECTED: 'Aborted',
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
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const getWorkDefinitionBy = useStore(state => state.getWorkDefinitionBy);

  const data = workflows
    .map(workflow => {
      const definition = getWorkDefinitionBy('byName', workflow.workFlowName);

      return {
        id: workflow.workFlowExecutionId,
        name: workflow.workFlowName,
        type: definition?.type,
        processingType: definition?.processingType,
        status: statusMap[workflow.workStatus],
        author: workflow.createUser,
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

  // TODO Add FilterList icon actions (filter by status)
  return (
    <Table
      title={
        <>
          <IconButton>
            <FilterListIcon />
          </IconButton>
          <Typography
            className={classes.filterHeader}
            display="inline"
            variant="h6"
          >
            Filters
          </Typography>
        </>
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
                  to={`${pluginRoutePrefix}/onboarding/${projectId}/${rowData?.id}/workflow-detail`}
                >
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
};
