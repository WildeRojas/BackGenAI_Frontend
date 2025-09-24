import React, { useCallback, useState } from "react";
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    type Node,
    type Edge,
    type Connection,
    ConnectionMode,
} from "@xyflow/react";
import { Sidebar } from "../../Components/Sidebar";
import { AssociationEdge, CompositionEdge, InheritanceEdge, AggregationEdge } from "./UmlEdges";

import "@xyflow/react/dist/style.css";
import { ClassNode } from "./Node";

// Definimos los tipos de nodos
const nodeTypes = {
    classNode: ClassNode,
};

// Nodos iniciales
const initialNodes: Node[] = [
    {
        id: "1",
        type: "classNode",
        position: { x: 200, y: 150 },
        data: { label: "Alumno", attributes: [] },
    },
    {
        id: "2",
        type: "classNode",
        position: { x: 600, y: 150 },
        data: { label: "Curso", attributes: [] },
    },
];

const edgeTypes = {
    association: AssociationEdge,
    inheritance: InheritanceEdge,
    aggregation: AggregationEdge,
    composition: CompositionEdge
};


// Edges iniciales
const initialEdges: Edge[] = [];

function getClosestHandles(sourceX: number, sourceY: number, targetX: number, targetY: number) {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;

    let sourceHandle = "source-right";
    let targetHandle = "target-left";

    // Horizontal dominante
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            sourceHandle = "source-right";
            targetHandle = "target-left";
        } else {
            sourceHandle = "source-left";
            targetHandle = "target-right";
        }
    } else {
        // Vertical dominante
        if (dy > 0) {
            sourceHandle = "source-bottom";
            targetHandle = "target-top";
        } else {
            sourceHandle = "source-top";
            targetHandle = "target-bottom";
        }
    }

    return { sourceHandle, targetHandle };
}


export const Diagrama: React.FC = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectNode, setSelectNode] = useState<string | null>(null);


    const [relationType, setRelationType] = useState<"association" | "inheritance" | "aggregation" | "composition">("association");
    // Conexiones entre nodos
    const onConnect = useCallback(
        (params: Connection) => {
            const sourceNode = nodes.find((n) => n.id === params.source);
            const targetNode = nodes.find((n) => n.id === params.target);

            if (!sourceNode || !targetNode) return;

            const sourceX = sourceNode.position.x;
            const sourceY = sourceNode.position.y;
            const targetX = targetNode.position.x;
            const targetY = targetNode.position.y;

            const { sourceHandle, targetHandle } = getClosestHandles(
                sourceX,
                sourceY,
                targetX,
                targetY
            );

            const newEdge: Edge = {
                ...params,
                id: `${params.source}-${params.target}-${Date.now()}`,
                type: relationType,
                sourceHandle,
                targetHandle,
                data: {
                    sourceCardinality: "1",
                    targetCardinality: "*",
                },
            };

            setEdges((eds) => addEdge(newEdge, eds));
        },
        [relationType, setEdges, nodes]
    );

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        if (selectNode) {
            // Ya había un nodo seleccionado → crear arista
            const sourceNode = nodes.find((n) => n.id === selectNode);
            const targetNode = node;
            if (!sourceNode || !targetNode) {
                setSelectNode(null);
                return;
            }
            const sourceX = sourceNode.position.x;
            const sourceY = sourceNode.position.y;
            const targetX = targetNode.position.x;
            const targetY = targetNode.position.y;
            const { sourceHandle, targetHandle } = getClosestHandles(
                sourceX,
                sourceY,
                targetX,
                targetY
            );
            const newEdge: Edge = {
                id: `${selectNode}-${node.id}-${Date.now()}`,
                source: selectNode,
                target: node.id,
                sourceHandle,
                targetHandle,
                type: relationType,
                data: {
                    sourceCardinality: "1",
                    targetCardinality: "*"
                }
            };
            setEdges((eds) => addEdge(newEdge, eds));
            setSelectNode(null); // reset
        } else {
            // Primer click → guardamos nodo
            setSelectNode(node.id);
        }
    };

    // Agregar un nuevo nodo
    const addNode = () => {
        const newNode: Node = {
            id: (nodes.length + 1).toString(),
            type: "classNode",
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: `Clase${nodes.length + 1}`, attributes: [] },
        };
        setNodes((nds) => nds.concat(newNode));
    };



    return (
        <div className="flex w-full h-screen">
            {/* Sidebar simple */}
            <Sidebar onAddNode={addNode} onSelectRelation={(type) => setRelationType(type as typeof relationType)} />
            {/* Lienzo principal */}
            <div className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    fitView
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    connectionMode={ConnectionMode.Loose}
                >
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    <Controls />
                    <MiniMap />
                </ReactFlow>
            </div>
        </div>
    );
};
