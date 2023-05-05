import React from 'react';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { type NotificationContent } from '../../models/notification';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import { getHumanReadableDate } from '../converters';
import Checkbox from '@material-ui/core/Checkbox';

const useRowStyles = makeStyles(theme => ({
  root: {
    backgroundColor: 'inherit !IMPORTANT',
    borderTop: `1px solid ${theme.palette.grey.A100}`,
  },
  nested: {
    backgroundColor: 'inherit !IMPORTANT',
    borderBottom: `none !IMPORTANT`,
  },
}));

interface NotificationListItemProps {
  notification: NotificationContent;
}

export function NotificationListItem({
  notification,
}: NotificationListItemProps): JSX.Element {
  const [open, setOpen] = React.useState(false);
  const styles = useRowStyles();

  return (
    <>
      <TableRow className={styles.root}>
        <TableCell padding="checkbox">
          <Checkbox />
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          style={{ width: '50%', paddingLeft: 0 }}
        >
          {notification.subject}
        </TableCell>
        <TableCell style={{ width: 'auto' }}>
          {getHumanReadableDate(notification.createdOn)}
        </TableCell>
        <TableCell padding="none" style={{ width: '2rem' }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table>
                <TableBody>
                  <TableRow className={styles.nested}>
                    <TableCell>{notification.body}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
