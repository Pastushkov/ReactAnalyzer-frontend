import React from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphLayout } from './useGraphLayout';
import type { RawNode, RawEdge } from './useGraphLayout';

interface DependencyGraphProps {
  nodes: RawNode[];
  edges: RawEdge[];
}

/**
 * Renders the React Flow dependency graph using the auto-layout hook.
 * Separates visualization UI from mathematical layout logic.
 */
export const DependencyGraph: React.FC<DependencyGraphProps> = ({ nodes, edges }) => {
  const { layoutedNodes, layoutedEdges } = useGraphLayout(nodes, edges);

  if (!layoutedNodes || layoutedNodes.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        No graph data available to display.
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        fitView
        minZoom={0.5}
        maxZoom={2}
        attributionPosition="bottom-right"
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls showInteractive={false} />
        <MiniMap 
          zoomable 
          pannable 
          // Match minimap colors to node border colors dynamically
          nodeColor={(node) => (node.style?.borderColor as string) || '#cbd5e1'} 
        />
      </ReactFlow>
    </div>
  );
};