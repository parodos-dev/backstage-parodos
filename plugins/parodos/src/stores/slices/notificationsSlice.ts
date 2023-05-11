import type { StateCreator } from 'zustand';
import { unstable_batchedUpdates } from 'react-dom';
import type { NotificationsSlice, State, StateMiddleware } from '../types';
import { Notifications } from '../../models/notification';
import * as urls from '../../urls';

export const createNotificationsSlice: StateCreator<
  State,
  StateMiddleware,
  [],
  NotificationsSlice
> = (set, get) => ({
  notificationsLoading: true,
  notificationsError: undefined,
  notifications: [],
  notificationsCount: 0,
  async fetchNotifications({ filter = 'ALL', page, rowsPerPage, fetch }) {
    set(state => {
      state.notificationsLoading = true;
    });

    try {
      let urlQuery = `?page=${page}&size=${rowsPerPage}&sort=NotificationMessage_createdOn,desc`;
      if (filter !== 'ALL') {
        urlQuery += `&state=${filter}`;
      }

      const response = await fetch(
        `${get().baseUrl}${urls.Notifications}${urlQuery}`,
      );

      const notifications = (await response.json()) as Notifications;

      set(state => {
        unstable_batchedUpdates(() => {
          state.notifications = notifications.content ?? [];
          state.notificationsLoading = false;
          state.notificationsCount = notifications.totalElements ?? 0;
        });
      });
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error fetching notifications', e);
      set(state => {
        state.notifications = [];
        state.notificationsError = e as Error;
      });
    }
  },
  async deleteNotifications({ ids, fetch }) {
    try {
      for (const id of ids) {
        await fetch(`${get().baseUrl}${urls.Notifications}/${id}`, {
          method: 'DELETE',
        });
      }
    } catch (e: unknown) {
      set(state => {
        // eslint-disable-next-line no-console
        console.error('Error fetching notifications', e);
        state.notificationsError = e as Error;
      });
    }
  },
  async setNotificationState({ id, newState, fetch }) {
    try {
      await fetch(
        `${get().baseUrl}${urls.Notifications}/${id}?operation=${newState}`,
        {
          method: 'PUT',
        },
      );

      set(state => {
        state.notifications = state.notifications.map(n => {
          if (newState !== 'READ' && n.id !== id) {
            return n;
          }

          return { ...n, read: true };
        });
      });
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error setting notification "', id, '" to: ', newState, e);
      set(state => {
        state.notificationsError = e as Error;
      });
    }
  },
});
