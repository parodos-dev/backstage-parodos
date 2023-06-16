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
  const unreadNotificationsCount = useStore(
    state => state.unreadNotificationsCount,
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
        const notifyIcon =
          label === 'Notification' && unreadNotificationsCount > 0;

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
                    {notifyIcon && (
                      <Badge
                        color="secondary"
                        badgeContent={unreadNotificationsCount}
                        overlap="rectangular"
                      >
                        <NotificationImportantIcon color="secondary" />
                      </Badge>
                    )}
                    {tabChildren}
                  </NavLink>
                </span>
              ),
            ),
          },
        };
      }),
    [unreadNotificationsCount],
  );

  return <HeaderTabs tabs={tabs} selectedIndex={selectedTab} />;
}
