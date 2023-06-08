import React, { FC, useMemo } from 'react';
import { observer } from 'mobx-react';
import {
  DEFAULT_LAYER,
  DEFAULT_WHEN_OFFSET,
  Layer,
  RunStatus,
  ScaleDetailsLevel,
  TaskNode,
  TOP_LAYER,
  useDetailsLevel,
  useHover,
  WhenDecorator,
  WithContextMenuProps,
  WithSelectionProps,
  type Node,
} from '@patternfly/react-topology';
import { makeStyles } from '@material-ui/core';
import pickBy from 'lodash.pickby';
import cs from 'classnames';

type DemoTaskNodeProps = {
  element: Node;
} & WithContextMenuProps &
  WithSelectionProps;

const useStyles = makeStyles(_theme => ({
  disabled: {
    '& g:not(.pf-m-idle) rect': {
      fill: '#F4F4F4',
    },
    '& g:not(.pf-m-idle) text': {
      fill: '#C8C8C8',
    },
    '& g:not(.pf-m-idle) svg path': {
      fill: '#BAC8D5',
    },
  },
}));

const DemoTaskNode: any = ({
  element,
  onContextMenu,
  contextMenuOpen,
  ...rest
}: DemoTaskNodeProps) => {
  const styles = useStyles();
  const data = element.getData();
  const [hover, hoverRef] = useHover();
  const detailsLevel = useDetailsLevel();

  const passedData: any = useMemo(() => {
    return pickBy(data, n => typeof n !== 'undefined');
  }, [data]);

  const hasTaskIcon = !!(data.taskIconClass || data.taskIcon);
  const whenDecorator = data.whenStatus ? (
    <WhenDecorator
      element={element}
      status={data.whenStatus}
      leftOffset={
        hasTaskIcon
          ? DEFAULT_WHEN_OFFSET + (element.getBounds().height - 4) * 0.85
          : DEFAULT_WHEN_OFFSET
      }
    />
  ) : null;

  return (
    <Layer
      id={
        detailsLevel !== ScaleDetailsLevel.high && hover
          ? TOP_LAYER
          : DEFAULT_LAYER
      }
    >
      <TaskNode
        ref={hoverRef}
        element={element}
        scaleNode={hover && detailsLevel !== ScaleDetailsLevel.high}
        hideDetailsAtMedium
        {...passedData}
        {...rest}
        truncateLength={20}
        className={cs({
          [styles.disabled]: passedData.status !== RunStatus.Idle,
        })}
      >
        {whenDecorator}
      </TaskNode>
    </Layer>
  );
};

export default observer(DemoTaskNode);
