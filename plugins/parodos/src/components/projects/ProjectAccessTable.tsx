import { Progress, Table, TableColumn } from '@backstage/core-components';
import { errorApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { BackstageTheme } from '@backstage/theme';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  makeStyles,
  Snackbar,
  SnackbarContent,
  TableCell,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { AccessRole, Project } from '../../models/project';
import { useStore } from '../../stores/workflowStore/workflowStore';
import useAsync from 'react-use/lib/useAsync';
import { fetchProjectMembers } from '../../api/fetchProjectMembers';
import { updateUserRole } from '../../api/updateUserRole';
import { removeUserFromProject } from '../../api/removeUserFromProject';

export interface ProjectAccessTableProps {
  project: Project;
}

interface AccessTableData {
  member: string;
  roles: [AccessRole, boolean][];
}

const roles: AccessRole[] = ['Owner', 'Admin', 'Developer'];

const useStyles = makeStyles<BackstageTheme>(theme => ({
  root: {
    padding: theme.spacing(0),
    marginBottom: theme.spacing(0),
    marginTop: theme.spacing(0),
    display: 'flex',
    flexFlow: 'row nowrap',
  },
  content: {
    width: '100%',
    maxWidth: 'inherit',
    flexWrap: 'nowrap',
    color: theme.palette.banner.text,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    '& a': {
      color: theme.palette.banner.link,
    },
  },
  icon: {
    fontSize: theme.typography.h6.fontSize,
  },
  button: {
    color: theme.palette.banner.closeButtonColor ?? 'inherit',
  },
  success: {
    backgroundColor: theme.palette.status.ok,
  },
}));

export function ProjectAccessTable({
  project,
}: ProjectAccessTableProps): JSX.Element {
  const { fetch } = useApi(fetchApiRef);
  const errorApi = useApi(errorApiRef);
  const baseUrl = useStore(state => state.baseUrl);
  const classes = useStyles();
  const [snackbarMessage, setSnackbarMessage] = useState<string>();
  const [undoRemove, setUndoRemove] = useState<() => void>();
  const [selectedMembers, setSelectedMembers] = useState<
    { name: string; role: AccessRole }[]
  >([]);

  const {
    error: getMembersError,
    loading,
    value: members = [],
  } = useAsync(
    async () => fetchProjectMembers(fetch, baseUrl, project.id),
    [fetch, baseUrl, project.id],
  );

  const columns: TableColumn<AccessTableData>[] = [
    {
      title: `PROJECT MEMBERS (${members.length})`,
      field: 'member',
      width: '15%',
    },
    { title: 'ROLE', field: 'roles' },
  ];

  const tableData: AccessTableData[] = members.map(member => ({
    member: `${member.firstName} ${member.lastName}`,
    roles: roles.map(role => [role, member.roles.includes(role)]),
  }));

  const [{ error: changeRoleError }, changeRole] = useAsyncFn(
    async (username: string, role: Exclude<AccessRole, 'Owner'>) => {
      await updateUserRole(fetch, baseUrl, project.id, [{ username, role }]);
      setSnackbarMessage(
        `User role for ${username} has been successfully changed to ${role}.`,
      );
    },
    [fetch, baseUrl, project.id],
  );

  const [{ error: transferOwnershipError }, transferOwnership] = useAsyncFn(
    async (username: string) => {
      const { username: ownerUsername } =
        members.find(member => member.roles.includes('Owner')) ?? {};
      await updateUserRole(fetch, baseUrl, project.id, [
        { username, role: 'Owner' },
        ...(ownerUsername
          ? [{ username: ownerUsername, role: 'Admin' as AccessRole }]
          : []),
      ]);
      setSnackbarMessage(
        `User ownership has been successfully transferred to ${username}.`,
      );
    },
    [fetch, baseUrl, project.id, members],
  );

  const [{ error: removeMembersError }, removeMembers] =
    useAsyncFn(async () => {
      const users = selectedMembers.map(({ name }) => name);
      await removeUserFromProject(fetch, baseUrl, project.id, users);
      setSelectedMembers([]);
      setSnackbarMessage(
        `You have successfully removed ${selectedMembers.length} contributor${
          selectedMembers.length > 1 ? 's' : ''
        } from this project.`,
      );
      setUndoRemove(
        () => () =>
          updateUserRole(
            fetch,
            baseUrl,
            project.id,
            selectedMembers.map(({ name, role }) => ({ username: name, role })),
          ),
      );
    }, [fetch, baseUrl, project.id, selectedMembers]);

  const handleSelectMember = useCallback(
    (event: React.ChangeEvent<{}>, selected: boolean) => {
      const name =
        event.target instanceof HTMLInputElement ? event.target.name : '';
      if (selected) {
        setSelectedMembers(prevSelected => [
          ...prevSelected,
          members.find(member => member.username === name)!,
        ]);
      } else {
        setSelectedMembers(prevSelected =>
          prevSelected.filter(member => member.name !== name),
        );
      }
    },
    [members],
  );

  useEffect(() => {
    const error =
      getMembersError ||
      changeRoleError ||
      transferOwnershipError ||
      removeMembersError;
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      errorApi.post(new Error('Failed to update project access'));
    }
  }, [
    errorApi,
    getMembersError,
    changeRoleError,
    transferOwnershipError,
    removeMembersError,
  ]);

  const Cell = useCallback(
    ({ columnDef, rowData }) => {
      const isOwner = rowData.roles.some(
        ([roleName, selected]: [AccessRole, boolean]) =>
          roleName === 'Owner' && selected,
      );
      if (columnDef.field === 'member') {
        return (
          <TableCell>
            <FormControlLabel
              control={<Checkbox />}
              label={rowData.member}
              name={rowData.member}
              disabled={isOwner || project.accessRole !== 'Owner'}
              onChange={handleSelectMember}
            />
          </TableCell>
        );
      } else if (columnDef.field === 'roles') {
        return (
          <TableCell>
            <Grid container spacing={1}>
              {rowData.roles.map(
                ([roleName, selected]: [AccessRole, boolean]) => (
                  <Grid key={roleName} item>
                    <FormControlLabel
                      control={<Checkbox />}
                      label={roleName}
                      checked={selected}
                      disabled={
                        isOwner ||
                        (project.accessRole !== 'Owner' && roleName === 'Owner')
                      }
                      onChange={() => {
                        if (selected) return;
                        if (roleName === 'Owner')
                          transferOwnership(rowData.member);
                        else changeRole(rowData.member, roleName);
                      }}
                    />
                  </Grid>
                ),
              )}
            </Grid>
          </TableCell>
        );
      }
      return <TableCell>{rowData[columnDef.field]}</TableCell>;
    },
    [project.accessRole, handleSelectMember, transferOwnership, changeRole],
  );

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={!!snackbarMessage}
        autoHideDuration={5000}
        onClose={(_, reason) => {
          if (reason === 'clickaway') return;
          setUndoRemove(undefined);
          setSnackbarMessage(undefined);
        }}
        classes={{ root: classes.root }}
      >
        <SnackbarContent
          classes={{
            root: classNames(classes.content, classes.success),
            message: classes.message,
          }}
          message={snackbarMessage}
          action={[
            ...(undoRemove
              ? [
                  <Button
                    key="undo"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      undoRemove?.();
                      setUndoRemove(undefined);
                      setSnackbarMessage(undefined);
                    }}
                  >
                    undo this action
                  </Button>,
                ]
              : []),
            <IconButton
              key="dismiss"
              title="Dismiss"
              className={classes.button}
              onClick={() => setSnackbarMessage(undefined)}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </Snackbar>
      <Table
        options={{ paging: false, search: false }}
        columns={columns}
        data={tableData}
        components={{
          Cell,
          // Row: ({ rowData, ...props }) => (),
        }}
      />
      {loading && <Progress />}
      <Button
        variant="text"
        color="primary"
        disabled={selectedMembers.length === 0}
        onClick={removeMembers}
      >
        Remove selected
      </Button>
    </>
  );
}
