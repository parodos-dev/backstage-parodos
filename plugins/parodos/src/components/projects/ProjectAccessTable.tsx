import { Table, TableColumn } from '@backstage/core-components';
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
import React, { useCallback, useState } from 'react';
import { AccessRole, Project } from '../../models/project';

export interface ProjectAccessTableProps {
  project: Project;
}

interface AccessTableData {
  member: string;
  roles: [AccessRole, boolean][];
}

const roles: AccessRole[] = ['Owner', 'Admin', 'Developer'];

const mockMembers: { name: string; role: AccessRole }[] = [
  { name: 'Luke Shannon', role: 'Owner' },
  { name: 'Piotr Kliczewski', role: 'Admin' },
  { name: 'Richard Wang', role: 'Developer' },
  { name: 'Moti Asayag', role: 'Developer' },
  { name: 'Paul Cowan', role: 'Developer' },
  { name: 'Dmitriy Lazarev', role: 'Developer' },
];

function useMockMembers() {
  const [members, setMembers] = useState(mockMembers);

  const addMember = useCallback(
    (name: string, role: AccessRole) =>
      setMembers(prevMembers => [...prevMembers, { name, role }]),
    [],
  );
  const removeMember = useCallback((name: string) => {
    let removedMember: { name: string; role: AccessRole } | undefined;
    setMembers(prevMembers =>
      prevMembers.filter(member => {
        if (member.name === name) {
          removedMember = member;
          return false;
        }
        return true;
      }),
    );
    return removedMember;
  }, []);
  const transferOwnership = useCallback(
    (name: string) =>
      setMembers(prevMembers =>
        prevMembers.map(member => {
          if (member.name === name) return { ...member, role: 'Owner' };
          if (member.role === 'Owner') return { ...member, role: 'Developer' };
          return member;
        }),
      ),
    [],
  );
  const changeRole = useCallback(
    (name: string, role: Exclude<AccessRole, 'Owner'>) =>
      setMembers(prevMembers =>
        prevMembers.map(member =>
          member.name === name ? { ...member, role } : member,
        ),
      ),
    [],
  );

  return { members, addMember, removeMember, transferOwnership, changeRole };
}

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
  // TODO Use real data when it will be available
  const { members, addMember, removeMember, transferOwnership, changeRole } =
    useMockMembers();

  const classes = useStyles();
  const [snackbarMessage, setSnackbarMessage] = useState<string>();
  const [undoRemove, setUndoRemove] = useState<() => void>();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const columns: TableColumn<AccessTableData>[] = [
    {
      title: `PROJECT MEMBERS (${members.length})`,
      field: 'member',
      width: '15%',
    },
    { title: 'ROLE', field: 'roles' },
  ];

  const tableData: AccessTableData[] = members.map(member => ({
    member: member.name,
    roles: roles.map(role => [role, role === member.role]),
  }));

  const handleSelectMember = useCallback(
    (event: React.ChangeEvent<{}>, selected: boolean) => {
      const name =
        event.target instanceof HTMLInputElement ? event.target.name : '';
      if (selected) {
        setSelectedMembers(prevSelected => [...prevSelected, name]);
      } else {
        setSelectedMembers(prevSelected =>
          prevSelected.filter(member => member !== name),
        );
      }
    },
    [],
  );

  const handleTransferOwnership = useCallback(
    (name: string) => {
      transferOwnership(name);
      setSnackbarMessage(
        `User ownership has been successfully transferred to ${name}.`,
      );
    },
    [transferOwnership],
  );

  const handleChangeRole = useCallback(
    (name: string, role: Exclude<AccessRole, 'Owner'>) => {
      changeRole(name, role);
      setSnackbarMessage(
        `User role for ${name} has been successfully changed to ${role}.`,
      );
    },
    [changeRole],
  );

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
                          handleTransferOwnership(rowData.member);
                        else handleChangeRole(rowData.member, roleName);
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
    [
      project.accessRole,
      handleSelectMember,
      handleTransferOwnership,
      handleChangeRole,
    ],
  );

  const handleRemoveSelected = () => {
    const removedMembers = selectedMembers
      .map(removeMember)
      .filter(<T extends any>(x: T): x is NonNullable<T> => !!x);
    setSelectedMembers([]);
    setSnackbarMessage(
      `You have successfully removed ${removedMembers.length} contributor${
        removedMembers.length > 1 ? 's' : ''
      } from this project.`,
    );
    setUndoRemove(() =>
      removedMembers.forEach(member => addMember(member.name, member.role)),
    );
  };

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
      <Button
        variant="text"
        color="primary"
        disabled={selectedMembers.length === 0}
        onClick={handleRemoveSelected}
      >
        Remove selected
      </Button>
    </>
  );
}
