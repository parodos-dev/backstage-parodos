import { Progress, Table, TableColumn } from '@backstage/core-components';
import {
  errorApiRef,
  fetchApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
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
  TextField,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classNames from 'classnames';
import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import {
  AccessRequest,
  AccessRole,
  AccessStatus,
  Project,
  ProjectMember,
} from '../../models/project';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { fetchProjectMembers } from '../../api/fetchProjectMembers';
import { updateUserRole } from '../../api/updateUserRole';
import { removeUserFromProject } from '../../api/removeUserFromProject';
import { fetchAccessRequests } from '../../api/fetchAccessRequests';
import { responseOnAccessRequest } from '../../api/responseOnAccessRequest';
import { useNavigate } from 'react-router-dom';
import { pluginRoutePrefix } from '../ParodosPage/navigationMap';

export interface ProjectAccessTableProps {
  project: Project;
}

interface AccessTableData {
  requestId?: string;
  username: string;
  member: string;
  roles: { name: string; disabled: boolean; selected: boolean }[];
  disabled: boolean;
  selected: boolean;
}

const accessRoles: AccessRole[] = ['OWNER', 'ADMIN', 'DEVELOPER'];
const accessRoleMap: Record<AccessRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  DEVELOPER: 'Developer',
} as const;
const accessRoleBackMap: Record<string, AccessRole> = {
  Owner: 'OWNER',
  Admin: 'ADMIN',
  Developer: 'DEVELOPER',
};

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
  roleRequestMessage: {
    display: 'flex',
  },
  commentTextfield: {
    width: '100%',
  },
  responseButtons: {
    flexShrink: 0,
  },
}));

export function ProjectAccessTable({
  project,
}: ProjectAccessTableProps): JSX.Element {
  const { fetch } = useApi(fetchApiRef);
  const errorApi = useApi(errorApiRef);
  const identityApi = useApi(identityApiRef);
  const navigate = useNavigate();
  const baseUrl = useStore(state => state.baseUrl);
  const fetchProjects = useStore(state => state.fetchProjects);
  const classes = useStyles();
  const [snackbarMessage, setSnackbarMessage] = useState<string>();
  const [undoRemove, setUndoRemove] = useState<() => void>();
  const [selectedMembers, setSelectedMembers] = useState<
    { username: string; roles: AccessRole[] }[]
  >([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<string>();

  const [{ error: getMembersError, loading: loadingMembers }, getMembers] =
    useAsyncFn(
      () => fetchProjectMembers(fetch, baseUrl, project.id),
      [fetch, baseUrl, project.id],
    );

  const [
    { error: getAccessRequestsError, loading: loadingAccessRequests },
    getRequests,
  ] = useAsyncFn(
    () => fetchAccessRequests(fetch, baseUrl, { projectId: project.id }),
    [fetch, baseUrl, project.id],
  );

  const columns: TableColumn<AccessTableData>[] = [
    {
      title: `PROJECT MEMBERS (${members.length})`,
      field: 'member',
      width: '15%',
    },
    { title: 'ROLES', field: 'roles' },
  ];

  const currentMember = members.find(
    ({ username }) => username === currentUser,
  );
  const owners = members.filter(({ roles }) => roles.includes('OWNER'));
  const selectedOwners = selectedMembers.filter(({ roles }) =>
    roles.includes('OWNER'),
  );
  const isOwner = currentMember?.roles.includes('OWNER') ?? false;
  const isAdmin = currentMember?.roles.includes('ADMIN') ?? false;

  const tableData: AccessTableData[] = [...requests, ...members].map(member => {
    const selected = selectedMembers.some(
      ({ username }) => username === member.username,
    );
    const roles = 'role' in member ? [member.role] : member.roles;
    return {
      requestId:
        'accessRequestId' in member ? member.accessRequestId : undefined,
      username: member.username,
      member:
        'accessRequestId' in member
          ? `${member.firstname} ${member.lastname}`
          : `${member.firstName} ${member.lastName}`,
      roles: accessRoles.map(role => {
        const selectedRole = roles.includes(role);
        return {
          name: accessRoleMap[role],
          selected: selectedRole,
          disabled:
            (!isOwner && !isAdmin) ||
            (selectedRole && roles.length <= 1) ||
            (!isOwner && role === 'OWNER') ||
            (selectedRole && role === 'OWNER' && owners.length <= 1),
        };
      }),
      selected,
      disabled:
        !isOwner ||
        (!selected &&
          owners.length - selectedOwners.length <= 1 &&
          roles.includes('OWNER')),
    };
  });

  useEffect(() => {
    if (owners.length === selectedOwners.length) {
      setSelectedMembers(prevSelected =>
        prevSelected.filter(({ roles }) => !roles.includes('OWNER')),
      );
    }
  }, [owners, selectedOwners]);

  const [{ error: changeRoleError }, changeRole] = useAsyncFn(
    async (username: string, role: AccessRole) => {
      const roles = members.find(member => member.username === username)!.roles;
      if (roles.includes(role)) {
        roles.splice(roles.indexOf(role), 1);
      } else {
        roles.push(role as AccessRole);
      }
      await updateUserRole(fetch, baseUrl, project.id, [{ username, roles }]);
      setMembers(await getMembers());
      setSnackbarMessage(
        `User role${
          roles.length > 1 ? 's' : ''
        } for ${username} has been successfully changed to ${roles.join(
          ', ',
        )}.`,
      );
    },
    [fetch, baseUrl, project.id, members, getMembers],
  );

  const [{ error: removeMembersError }, removeMembers] =
    useAsyncFn(async () => {
      const users = selectedMembers.map(({ username }) => username);
      await removeUserFromProject(fetch, baseUrl, project.id, users);
      setMembers(await getMembers());
      setSelectedMembers([]);
      setSnackbarMessage(
        `You have successfully removed ${selectedMembers.length} contributor${
          selectedMembers.length > 1 ? 's' : ''
        } from this project.`,
      );
      if (selectedMembers.some(({ username }) => username === currentUser)) {
        fetchProjects(fetch, true);
        navigate(`${pluginRoutePrefix}/projects`);
      } else {
        setUndoRemove(() => async () => {
          await updateUserRole(fetch, baseUrl, project.id, selectedMembers);
          setMembers(await getMembers());
        });
      }
    }, [
      selectedMembers,
      fetch,
      baseUrl,
      project.id,
      getMembers,
      currentUser,
      fetchProjects,
      navigate,
    ]);

  const [{ error: responseRequestError }, responseRequest] = useAsyncFn(
    async (requestId: string, status: AccessStatus, comment?: string) => {
      await responseOnAccessRequest(fetch, baseUrl, requestId, {
        comment,
        status,
      });
      setMembers(await getMembers());
      setRequests(await getRequests());
      setSnackbarMessage(
        `You have successfully ${
          status === 'APPROVED' ? 'approved' : 'rejected'
        } the request.`,
      );
    },
    [fetch, baseUrl, getMembers, getRequests],
  );

  const handleRequestAccess = useCallback(
    (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
      e.preventDefault();
      const { submitter } = e.nativeEvent;
      const { requestId, comment, reject } = e.currentTarget;

      responseRequest(
        requestId.value,
        reject === submitter ? 'REJECTED' : 'APPROVED',
        comment.value,
      );
    },
    [responseRequest],
  );

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
          prevSelected.filter(member => member.username !== name),
        );
      }
    },
    [members],
  );

  useEffect(() => {
    const error =
      getMembersError ||
      getAccessRequestsError ||
      changeRoleError ||
      removeMembersError ||
      responseRequestError;
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      if (changeRoleError || removeMembersError || responseRequestError) {
        errorApi.post(new Error('Failed to update project access'));
      }
      if (getMembersError || getAccessRequestsError) {
        errorApi.post(new Error('Failed to get project members'));
      }
    }
  }, [
    errorApi,
    getMembersError,
    getAccessRequestsError,
    changeRoleError,
    removeMembersError,
    responseRequestError,
  ]);

  useEffect(() => {
    getMembers().then(setMembers);
    getRequests().then(setRequests);
    identityApi
      .getProfileInfo()
      .then(({ displayName }) => setCurrentUser(displayName));
  }, [getMembers, getRequests, identityApi]);

  const Cell = useCallback(
    ({ columnDef, rowData }) => {
      if (rowData.requestId) {
        const { name: roleName } = rowData.roles.find(
          ({
            selected,
          }: {
            name: string;
            disabled: boolean;
            selected: boolean;
          }) => selected,
        )!;
        if (columnDef.field === 'member') {
          return (
            <TableCell>
              <Typography variant="body2">{rowData.member}</Typography>
            </TableCell>
          );
        } else if (columnDef.field === 'roles') {
          return (
            <TableCell>
              <form onSubmit={handleRequestAccess}>
                <input
                  type="hidden"
                  name="requestId"
                  value={rowData.requestId}
                />
                <Grid container spacing={1} wrap="nowrap">
                  <Grid
                    item
                    alignItems="center"
                    className={classes.roleRequestMessage}
                  >
                    <Typography variant="body2">{`Requested access to the project with "${roleName}" role.`}</Typography>
                  </Grid>
                  <Grid item className={classes.commentTextfield}>
                    <TextField
                      className={classes.commentTextfield}
                      name="comment"
                      label="Comment (optional)"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item className={classes.responseButtons}>
                    <Grid container spacing={1}>
                      <Grid item>
                        <Button
                          name="approve"
                          value="APPROVED"
                          variant="outlined"
                          color="primary"
                          type="submit"
                        >
                          Approve
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button
                          name="reject"
                          value="REJECTED"
                          variant="outlined"
                          color="secondary"
                          type="submit"
                        >
                          Reject
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </form>
            </TableCell>
          );
        }
      }

      if (columnDef.field === 'member') {
        return (
          <TableCell>
            <FormControlLabel
              control={<Checkbox />}
              label={rowData.member}
              name={rowData.username}
              disabled={rowData.disabled}
              onChange={handleSelectMember}
              checked={rowData.selected}
            />
          </TableCell>
        );
      } else if (columnDef.field === 'roles') {
        return (
          <TableCell>
            <Grid container spacing={1}>
              {rowData.roles.map(
                ({
                  name,
                  selected,
                  disabled,
                }: {
                  name: string;
                  disabled: boolean;
                  selected: boolean;
                }) => {
                  return (
                    <Grid key={name} item>
                      <FormControlLabel
                        control={<Checkbox />}
                        label={name}
                        checked={selected}
                        disabled={disabled}
                        onChange={() =>
                          changeRole(rowData.username, accessRoleBackMap[name])
                        }
                      />
                    </Grid>
                  );
                },
              )}
            </Grid>
          </TableCell>
        );
      }
      return <TableCell>{rowData[columnDef.field]}</TableCell>;
    },
    [handleRequestAccess, classes, handleSelectMember, changeRole],
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
        }}
      />
      {(loadingMembers || loadingAccessRequests) && <Progress />}
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
