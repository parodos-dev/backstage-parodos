import { NotificationState } from '../../stores/types';

type Action = 'DELETE' | 'ARCHIVE';

type Actions =
  | {
      type: 'DELETE';
    }
  | {
      type: 'ARCHIVE';
    }
  | {
      type: 'FINISH_ACTION';
    }
  | {
      type: 'CHECK';
      payload: {
        notificationId: string;
        checked: boolean;
      };
    }
  | {
      type: 'CLOSE_DIALOG';
    }
  | {
      type: 'CLOSE_ALERT';
    }
  | {
      type: 'CHANGE_PAGE';
      payload: {
        page: number;
      };
    }
  | {
      type: 'CHANGE_ROWS_PER_PAGE';
      payload: {
        rows: number;
      };
    }
  | {
      type: 'CHANGE_FILTER';
      payload: {
        filter: NotificationState;
      };
    };

export const initialState = {
  page: 0,
  rowsPerPage: 10,
  dialogOpen: false,
  showAlert: false,
  selectedNotifications: [] as string[],
  action: 'ARCHIVE' as Action,
  notificationFilter: 'ALL' as NotificationState,
};

export type State = typeof initialState;

export const reducer = (draft: State, action: Actions) => {
  switch (action.type) {
    case 'DELETE': {
      draft.action = 'DELETE';
      draft.dialogOpen = true;

      break;
    }
    case 'ARCHIVE': {
      draft.action = 'ARCHIVE';
      draft.dialogOpen = true;

      break;
    }
    case 'FINISH_ACTION': {
      draft.dialogOpen = false;
      draft.showAlert = true;
      draft.selectedNotifications = [];

      break;
    }
    case 'CHECK': {
      if (action.payload.checked) {
        draft.selectedNotifications = [
          ...draft.selectedNotifications,
          action.payload.notificationId,
        ];
      } else {
        draft.selectedNotifications = draft.selectedNotifications.filter(
          n => n !== action.payload.notificationId,
        );
      }

      break;
    }
    case 'CLOSE_DIALOG': {
      draft.dialogOpen = false;

      break;
    }
    case 'CLOSE_ALERT': {
      draft.showAlert = false;

      break;
    }
    case 'CHANGE_PAGE': {
      draft.page = action.payload.page;

      break;
    }
    case 'CHANGE_ROWS_PER_PAGE': {
      draft.rowsPerPage = action.payload.rows;
      draft.page = 0;

      break;
    }
    case 'CHANGE_FILTER': {
      draft.notificationFilter = action.payload.filter;
      draft.page = 0;

      break;
    }
    default: {
      throw new Error(`unknown action type`);
    }
  }
};
