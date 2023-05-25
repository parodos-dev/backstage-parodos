import React, { forwardRef, type ReactNode, useCallback, useMemo } from 'react';
import { navigationMap, pluginRoutePrefix } from './navigationMap';
import StarIcon from '@material-ui/icons/Star';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import { makeStyles } from '@material-ui/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { HeaderTabs } from '@backstage/core-components';

const useStyles = makeStyles(theme => ({
  highlightedTab: {
    position: 'absolute',
    top: '1rem',
    right: 0,
    color: '#F70D1A',
  },
  unreadNotification: {
    '& path': {
      fill: theme.palette.error.main,
    },
  },
}));

export function Tabs(): JSX.Element {
  const styles = useStyles();
  const { pathname } = useLocation();
  const hasProjects = useStore(state => state.hasProjects());
  const unreadNotificaitons = useStore(state => state.unReadNotifications);
  const navigate = useNavigate();

  const onChangeTab = useCallback(
    tabIndex => {
      const { routes } = navigationMap[tabIndex];
      navigate(`${pluginRoutePrefix}${routes[0]}`);
    },
    [navigate],
  );

  const selectedTab = useMemo(
    () =>
      Math.max(
        navigationMap.findIndex(({ routes }) =>
          routes.find(route => pathname.includes(route)),
        ),
        0,
      ),
    [pathname],
  );

  const tabs = useMemo(
    () =>
      navigationMap.map(({ label }, index) => {
        const highlighted = selectedTab === 0 && index === 1 && !hasProjects;
        const notifyIcon = index === 2 && unreadNotificaitons > 0;

        return {
          id: index.toString(),
          label,
          tabProps: {
            component: forwardRef<HTMLSpanElement, any>(
              (
                { children: tabChildren, ...tabProps }: { children: ReactNode },
                ref,
              ) => (
                <span {...tabProps} ref={ref}>
                  {navigationMap[index].icon}
                  {highlighted && (
                    <StarIcon className={styles.highlightedTab} />
                  )}
                  {tabChildren}
                  {notifyIcon && (
                    <NotificationImportantIcon
                      className={styles.unreadNotification}
                    />
                  )}
                </span>
              ),
            ),
          },
        };
      }),
    [
      hasProjects,
      selectedTab,
      styles.highlightedTab,
      styles.unreadNotification,
      unreadNotificaitons,
    ],
  );

  return (
    <HeaderTabs
      selectedIndex={selectedTab}
      onChange={onChangeTab}
      tabs={tabs}
    />
  );
}
