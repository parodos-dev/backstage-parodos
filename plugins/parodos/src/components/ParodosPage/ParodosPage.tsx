import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useMemo,
  type FC,
} from 'react';
import { Content, HeaderTabs, Page } from '@backstage/core-components';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../PageHeader';
import type { PropsFromComponent } from '../types';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import { navigationMap, pluginRoutePrefix } from './navigationMap';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { ErrorMessage } from '../errors/ErrorMessage';
import StarIcon from '@material-ui/icons/Star';
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';

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

// Unfortunately backstage do not export the props type for <Content />
type ContentProps = PropsFromComponent<typeof Content>;

type ParodosPageProps = ContentProps;

export const ParodosPage: FC<ParodosPageProps> = ({ children, ...props }) => {
  const styles = useStyles();
  const { pathname } = useLocation();
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
  const hasProjects = useStore(state => state.hasProjects());
  const unreadNotificaitons = useStore(state => state.unReadNotifications);
  const error = useStore(state => state.error());

  const navigate = useNavigate();

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

  const onChangeTab = useCallback(
    tabIndex => {
      const { routes } = navigationMap[tabIndex];
      navigate(`${pluginRoutePrefix}${routes[0]}`);
    },
    [navigate],
  );

  return (
    <Page themeId="tool">
      <PageHeader />
      <HeaderTabs
        selectedIndex={selectedTab}
        onChange={onChangeTab}
        tabs={tabs}
      />
      <Content {...props}>
        {error && <ErrorMessage error={error as Error} />}
        {children}
      </Content>
    </Page>
  );
};
