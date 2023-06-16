import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_EDGE_TYPE,
  DEFAULT_FINALLY_NODE_TYPE,
  DEFAULT_SPACER_NODE_TYPE,
  getEdgesFromNodes,
  getSpacerNodes,
  Graph,
  GRAPH_LAYOUT_END_EVENT,
  Layout,
  PipelineDagreLayout,
  SELECTION_EVENT,
  SelectionEventListener,
  TopologyView,
  useEventListener,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  useVisualizationController,
} from '@patternfly/react-topology';
import '@patternfly/react-styles/css/components/Topology/topology-components.css';
import pipelineComponentFactory from './pipelineComponentFactory';
import { useDemoPipelineNodes } from './useDemoPipelineNodes';
import { WorkflowTask } from '../../../../models/workflowTaskSchema';
import { useParentSize } from '@cutting/use-get-parent-size';
import { FirstTaskId } from '../../../../hooks/getWorkflowDefinitions';
import { useWorkflowContext } from '../WorkflowContext';
import { WorkflowAlert } from './WorkflowAlert';

export const PIPELINE_NODE_SEPARATION_VERTICAL = 10;

const PIPELINE_LAYOUT = 'PipelineLayout';

type Props = {
  tasks: WorkflowTask[];
  setSelectedTask: (selectedTask: string) => void;
};

const TopologyPipelineLayout = ({ tasks, setSelectedTask }: Props) => {
  const { workflowMode, showAlert, clearAlert } = useWorkflowContext();
  const [selectedIds, setSelectedIds] = useState<string[]>();
  const pipelineNodes = useDemoPipelineNodes(tasks);
  const controller = useVisualizationController();
  const containerRef = useRef<HTMLDivElement>(null);

  const alertTask = useMemo(
    () => tasks.find(t => !!t.alertMessage && t.status !== 'COMPLETED'),
    [tasks],
  );

  useParentSize(containerRef, {
    callback: () => {
      controller.getGraph().fit(70);
    },
    debounceDelay: 500,
  });

  useEffect(() => {
    if (workflowMode === 'RUNNING' && !!alertTask) {
      showAlert(alertTask);
    }
  }, [alertTask, showAlert, workflowMode]);

  useEffect(() => {
    if (workflowMode === 'TASK_ALERT' && !alertTask) {
      clearAlert();
    }
  }, [clearAlert, alertTask, workflowMode]);

  useEffect(() => {
    const spacerNodes = getSpacerNodes(pipelineNodes);
    const nodes = [...pipelineNodes, ...spacerNodes];
    const edgeType = DEFAULT_EDGE_TYPE;
    const edges = getEdgesFromNodes(
      nodes.filter(n => !n.group),
      DEFAULT_SPACER_NODE_TYPE,
      edgeType,
      edgeType,
      [DEFAULT_FINALLY_NODE_TYPE],
      edgeType,
    );

    controller.fromModel(
      {
        graph: {
          id: 'g1',
          type: 'graph',
          layout: PIPELINE_LAYOUT,
          // to disable scale, add: scaleExtent: [1, 0],
        },
        nodes,
        edges,
      },
      true,
    );
  }, [controller, pipelineNodes]);

  useEventListener<SelectionEventListener>(SELECTION_EVENT, ([taskId]) => {
    if (!taskId) {
      return;
    }

    const selected = tasks.find(task => task.id === taskId);

    if (!selected) {
      return;
    }

    if (taskId === FirstTaskId || selected.status === 'PENDING') {
      setSelectedTask(taskId);
      return;
    }

    setSelectedIds([taskId]);
    setSelectedTask(taskId);
  });

  return (
    <>
      {alertTask && <WorkflowAlert task={alertTask} />}
      <div ref={containerRef}>
        <TopologyView>
          <VisualizationSurface state={{ selectedIds }} />
        </TopologyView>
      </div>
    </>
  );
};

TopologyPipelineLayout.displayName = 'TopologyPipelineLayout';

export const PipelineLayout = memo((props: Props) => {
  const controller = useMemo(() => new Visualization(), []);
  controller.setFitToScreenOnLayout(true);
  controller.registerComponentFactory(pipelineComponentFactory);
  controller.registerLayoutFactory(
    (_type: string, graph: Graph): Layout | undefined =>
      new PipelineDagreLayout(graph, {
        nodesep: PIPELINE_NODE_SEPARATION_VERTICAL,
        ignoreGroups: true,
      }),
  );

  controller.addEventListener(GRAPH_LAYOUT_END_EVENT, () => {
    controller.getGraph().fit(70);
  });

  return (
    <VisualizationProvider controller={controller}>
      <TopologyPipelineLayout {...props} />
    </VisualizationProvider>
  );
});
