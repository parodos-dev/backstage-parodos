import { Table, TableColumn } from '@backstage/core-components';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TableCell,
} from '@material-ui/core';
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
  const removeMember = useCallback(
    (name: string) =>
      setMembers(prevMembers =>
        prevMembers.filter(member => member.name !== name),
      ),
    [],
  );
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

export function ProjectAccessTable({
  project,
}: ProjectAccessTableProps): JSX.Element {
  // TODO Use real data when it will be available
  const { members, removeMember, transferOwnership, changeRole } =
    useMockMembers();

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
                      onChange={() =>
                        roleName === 'Owner'
                          ? transferOwnership(rowData.member)
                          : changeRole(rowData.member, roleName)
                      }
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
    [project.accessRole, changeRole, transferOwnership, handleSelectMember],
  );

  const handleRemoveSelected = () => {
    selectedMembers.forEach(removeMember);
    setSelectedMembers([]);
  };

  return (
    <>
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
