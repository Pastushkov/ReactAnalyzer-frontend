import { useMemo } from 'react';
import { MarkerType, Position, type Node, type Edge } from 'reactflow';
import dagre from 'dagre';

export interface RawNode {
  id: string;
  type: string;
  data: { label: string };
}

export interface RawEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 50;

/**
 * Computes the auto-layout for React Flow nodes using dagre.
 * Maps raw backend data into React Flow compatible nodes and edges.
 */
export const useGraphLayout = (
  rawNodes: RawNode[],
  rawEdges: RawEdge[],
  direction: 'TB' | 'LR' = 'TB'
) => {
  return useMemo(() => {
    if (!rawNodes || rawNodes.length === 0) {
      return { layoutedNodes: [], layoutedEdges: [] };
    }

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Set layout direction (Top-Bottom by default) and spacing
    dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 80 });

    // Register nodes with their dimensions
    rawNodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    // Register edges
    rawEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calculate the layout coordinates
    dagre.layout(dagreGraph);

    // Map to React Flow Nodes
    const layoutedNodes: Node[] = rawNodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      
      return {
        id: node.id,
        // Using default React Flow node type, custom nodes can be added later
        type: 'default', 
        data: node.data,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        position: {
          x: nodeWithPosition.x - NODE_WIDTH / 2,
          y: nodeWithPosition.y - NODE_HEIGHT / 2,
        },
        style: getNodeStyle(node.type),
      };
    });

    // Map to React Flow Edges and highlight problematic dependencies
    const layoutedEdges: Edge[] = rawEdges.map((edge) => {
      const isProblematic = edge.type === 'missing_dependency';
      
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.type,
        // Animate active operational links
        animated: edge.type === 'calls' || edge.type === 'uses',
        style: {
          stroke: isProblematic ? '#ef4444' : '#64748b', // Red for problematic edges
          strokeWidth: isProblematic ? 2 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isProblematic ? '#ef4444' : '#64748b',
        },
      };
    });

    return { layoutedNodes, layoutedEdges };
  }, [rawNodes, rawEdges, direction]);
};

/**
 * Returns custom CSS properties based on the node type.
 */
function getNodeStyle(type: string): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    borderRadius: '8px',
    border: '2px solid',
    padding: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
    background: '#ffffff',
  };

  switch (type) {
    case 'component':
      return { ...baseStyle, borderColor: '#3b82f6', color: '#1e3a8a', background: '#eff6ff' };
    case 'state':
      return { ...baseStyle, borderColor: '#10b981', color: '#064e3b', background: '#ecfdf5' };
    case 'effect':
      return { ...baseStyle, borderColor: '#8b5cf6', color: '#4c1d95', background: '#f5f3ff' };
    case 'function':
      return { ...baseStyle, borderColor: '#f59e0b', color: '#78350f', background: '#fffbeb' };
    case 'prop':
      return { ...baseStyle, borderColor: '#ec4899', color: '#831843', background: '#fdf2f8' };
    default:
      return { ...baseStyle, borderColor: '#94a3b8', color: '#334155' };
  }
}