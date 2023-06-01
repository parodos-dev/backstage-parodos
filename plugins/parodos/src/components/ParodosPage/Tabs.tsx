import React, { forwardRef, type ReactNode, useMemo } from 'react';
import { navigationMap, pluginRoutePrefix } from './navigationMap';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import { Badge } from '@material-ui/core';
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { HeaderTabs } from '@backstage/core-components';

export interface TabLabelProps {
  children: ReactNode;
}

export function Tabs(): JSX.Element {
  const { pathname } = useLocation();
  const notifications = useStore(state => state.notifications);

  const unreadNotificaitons = useMemo(
    () =>
      [...notifications.values()].reduce(
        (acc, n) => (!n.read ? acc + 1 : acc),
        0,
      ),
    [notifications],
  );

  const selectedTab = useMemo(
    () =>
      Math.max(
        navigationMap.findIndex(({ route }) => pathname.includes(route)),
        0,
      ),
    [pathname],
  );

  const tabs = useMemo(
    () =>
      navigationMap.map(({ label, route }, index) => {
        const notifyIcon = label === 'Notification' && unreadNotificaitons > 0;

        return {
          id: index.toString(),
          label,
          tabProps: {
            component: forwardRef<HTMLSpanElement, TabLabelProps>(
              (
                { children: tabChildren, ...tabProps }: { children: ReactNode },
                ref,
              ) => (
                <span {...tabProps} ref={ref}>
                  <NavLink to={`${pluginRoutePrefix}${route}`}>
                    {navigationMap[index].icon}
                    {tabChildren}
                    {notifyIcon && (
                      <Badge
                        color="secondary"
                        badgeContent={unreadNotificaitons}
                        overlap="rectangular"
                      >
                        <NotificationImportantIcon color="secondary" />
                      </Badge>
                    )}
                  </NavLink>
                </span>
              ),
            ),
          },
        };
      }),
    [unreadNotificaitons],
  );

  return <HeaderTabs tabs={tabs} selectedIndex={selectedTab} />;
}
