import type { StateCreator } from 'zustand';
import { unstable_batchedUpdates } from 'react-dom';
import type { NotificationsSlice, State, StateMiddleware } from '../types';
import { Notifications } from '../../models/notification';
import * as urls from '../../urls';

async function fetchNotifications(
  baseUrl: string,
  options: Parameters<NotificationsSlice['fetchNotifications']>[0],
) {
  const { filter, page, rowsPerPage, fetch } = options;
  let urlQuery = `?page=${page}&size=${rowsPerPage}&sort=notificationMessage.createdOn,desc`;
  if (filter !== 'ALL') {
    urlQuery += `&state=${filter}`;
  }

  const response = await fetch(`${baseUrl}${urls.Notifications}${urlQuery}`);

  return (await response.json()) as Notifications;
}

export const createNotificationsSlice: StateCreator<
  State,
  StateMiddleware,
  [],
  NotificationsSlice
> = (set, get) => ({
  notificationsLoading: false,
  notificationsError: undefined,
  notifications: new Map(),
  notificationsCount: 0,
  unreadNotificationsCount: 0,
  async fetchUnreadNotificationsCount(fetch) {
    try {
      const notifications = await fetchNotifications(get().baseUrl as string, {
        filter: 'UNREAD',
        page: 0,
        rowsPerPage: 0,
        fetch,
      });
      set(state => {
        state.unreadNotificationsCount = notifications.totalElements ?? 0;
      });
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error fetching notifications', e);
    }
  },
  async fetchNotifications({ filter = 'ALL', page, rowsPerPage, fetch }) {
    if (get().notificationsLoading) {
      return;
    }

    set(state => {
      state.notificationsLoading = true;
    });

    try {
      const notifications = await fetchNotifications(get().baseUrl as string, {
        filter,
        page,
        rowsPerPage,
        fetch,
      });

      const existing = get().notifications;

      const newNotifications = new Set(notifications.content.map(p => p.id));

      if (
        get().initiallyLoaded &&
        existing.size === newNotifications.size &&
        [...newNotifications].every(id => existing.has(id))
      ) {
        if (get().notificationsLoading) {
          set(state => {
            state.notificationsLoading = false;
          });
        }

        return;
      }

      set(state => {
        unstable_batchedUpdates(() => {
          state.notifications = new Map(
            (notifications.content ?? []).map(n => [n.id, n]),
          );
          state.notificationsCount = notifications.totalElements ?? 0;
        });
      });
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error fetching notifications', e);
      set(state => {
        state.notifications = new Map();
        state.notificationsError = e as Error;
        state.notificationsLoading = false;
      });
    } finally {
      set(state => {
        state.notificationsLoading = false;
      });
    }
  },
  async deleteNotifications({ ids, fetch }) {
    set(state => {
      state.notificationsLoading = true;
    });

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
    } finally {
      set(state => {
        state.notificationsLoading = false;
      });
    }
  },
  async setNotificationState({ id, newState, fetch }) {
    set(state => {
      state.notificationsLoading = true;
    });

    try {
      await fetch(
        `${get().baseUrl}${urls.Notifications}/${id}?operation=${newState}`,
        {
          method: 'PUT',
        },
      );

      set(state => {
        const notification = state.notifications.get(id);
        if (newState === 'READ' && notification) {
          state.notifications = state.notifications.set(id, {
            ...notification,
            read: true,
          });
        }
      });
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error(`Error setting notification ${id} to: ${newState}`, e);
      set(state => {
        state.notificationsError = e as Error;
      });
    } finally {
      set(state => {
        state.notificationsLoading = false;
      });
    }
  },
});
