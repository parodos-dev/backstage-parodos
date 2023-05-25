import React, { forwardRef, type ReactNode, useCallback, useMemo } from 'react';
import { navigationMap, pluginRoutePrefix } from './navigationMap';
import StarIcon from '@material-ui/icons/Star';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import { Badge, makeStyles } from '@material-ui/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { HeaderTabs } from '@backstage/core-components';

const useStyles = makeStyles(_theme => ({
  highlightedTab: {
    position: 'absolute',
    top: '1rem',
    right: 0,
    color: '#F70D1A',
  },
}));

export function Tabs(): JSX.Element {
  const styles = useStyles();
  const { pathname } = useLocation();
  const hasProjects = useStore(state => state.hasProjects());
  const notifications = useStore(state => state.notifications);
  const navigate = useNavigate();

  const unreadNotificaitons = useMemo(
    () =>
      [...notifications.values()].reduce(
        (acc, n) => (!n.read ? acc + 1 : acc),
        0,
      ),
    [notifications],
  );

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
                    <Badge color="secondary" badgeContent={unreadNotificaitons}>
                      <NotificationImportantIcon color="secondary" />
                    </Badge>
                  )}
                </span>
              ),
            ),
          },
        };
      }),
    [hasProjects, selectedTab, styles.highlightedTab, unreadNotificaitons],
  );

  return (
    <HeaderTabs
      selectedIndex={selectedTab}
      onChange={onChangeTab}
      tabs={tabs}
    />
  );
}
