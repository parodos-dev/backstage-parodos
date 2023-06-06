import React, {
  type MouseEventHandler,
  useCallback,
  useState,
  SyntheticEvent,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useStore } from '../../stores/workflowStore/workflowStore';
import cs from 'classnames';
import { renderers } from '../markdown/renderers';

const useRowStyles = makeStyles(theme => ({
  root: {
    backgroundColor: 'inherit !IMPORTANT',
    borderTop: `1px solid ${theme.palette.grey.A100}`,
    '&$selected': {
      backgroundColor: '#E8F1FA !IMPORTANT',
    },
    '&:not(.read) [role="cell"]': {
      fontWeight: 600,
    },
    '&.read [role="cell"]': {
      fontWeight: 400,
      color: '#BABABA',
    },
    '& [role="cell"]:first-of-type': {
      width: '50%',
      paddingLeft: 0,
    },
    '& [role="cell"]:nth-child(3)': {
      width: 'auto',
    },
    '& [role="cell"]:nth-child(4)': {
      width: '2rem',
    },
  },
  nested: {
    backgroundColor: 'inherit !IMPORTANT',
    borderBottom: `none !IMPORTANT`,
  },
  selected: {},
  body: {
    fontWeight: 800,
  },
}));

interface NotificationListItemProps {
  notification: NotificationContent;
  checkboxClickHandler: MouseEventHandler<HTMLButtonElement>;
  isSelected(id: string): boolean;
}

export function NotificationListItem({
  notification,
  checkboxClickHandler,
  isSelected,
}: NotificationListItemProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const styles = useRowStyles();
  const { fetch } = useApi(fetchApiRef);
  const setNotificationState = useStore(state => state.setNotificationState);
  const [read, setRead] = useState(notification.read);

  const markNotificationRead = useCallback(async () => {
    if (read) {
      return;
    }

    await setNotificationState({
      id: notification.id,
      newState: 'READ',
      fetch,
    });

    setRead(true);
  }, [fetch, notification.id, read, setNotificationState]);

  const clickHandler = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!open);
      await markNotificationRead();
    },
    [markNotificationRead, open],
  );

  return (
    <>
      <TableRow
        classes={{
          root: styles.root,
          selected: styles.selected,
        }}
        className={cs(read && 'read')}
        onClick={clickHandler}
        hover
        selected={isSelected(notification.id)}
      >
        <TableCell padding="checkbox">
          <Checkbox
            id={notification.id}
            onClick={checkboxClickHandler}
            checked={isSelected(notification.id)}
          />
        </TableCell>
        <TableCell component="th" scope="row">
          {notification.subject}
        </TableCell>
        <TableCell component="th">
          {getHumanReadableDate(notification.createdOn)}
        </TableCell>
        <TableCell padding="none" component="td">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={clickHandler}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table>
                <TableBody>
                  <TableRow className={styles.nested}>
                    <TableCell>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={renderers}
                      >
                        {notification.body}
                      </ReactMarkdown>
                    </TableCell>
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
