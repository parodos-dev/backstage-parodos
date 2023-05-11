import React from 'react';
import {
  MockFetchApi,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';
import { NotificationList } from './NotificationsList';
import { NotificationContent } from '../../models/notification';
import { fetchApiRef } from '@backstage/core-plugin-api';

const notifications: NotificationContent[] = [
  {
    id: '75bc63d7-5a7f-43be-92e9-a1b5a23e7952',
    subject: 'subject',
    createdOn: new Date('2023-05-10T13:40:15.202319Z'),
    messageType: 'test-type',
    body: 'test-body',
    fromuser: 'test',
    read: true,
    tags: [],
    folder: '',
  },
];

describe('<NotifiationList />', () => {
  it('can render a list of notifications', async () => {
    const checkBoxClickHandler = jest.fn();
    const notificationsLoading = false;

    const mockFetch = jest.fn().mockName('fetch');
    const m: MockFetchApi = new MockFetchApi({
      baseImplementation: mockFetch,
    });

    const apis = [[fetchApiRef, m.fetch as any]] as const;

    const { getByRole, getByText } = await renderInTestApp(
      <TestApiProvider apis={apis}>
        <NotificationList
          notifications={notifications}
          notificationsLoading={notificationsLoading}
          fetch={m.fetch}
          checkBoxClickHandler={checkBoxClickHandler}
          selectedNotificationIds={notifications.map(n => n.id)}
        />
      </TestApiProvider>,
    );

    expect(getByRole('checkbox')).toBeInTheDocument();
    expect(getByText('subject')).toBeInTheDocument();
  });
});
