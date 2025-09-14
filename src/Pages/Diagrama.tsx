import React, { useCallback } from "react"
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
} from "@xyflow/react"

import type { Connection, Edge, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css"

const initialNodes: Node[] = [{
    id: '1',
    type: 'input',
    position: { x: 200, y: 150 },
    data: { label: 'ClaseUsuario' },
},];
import { Sidebar } from "../Components/Sidebar";

const initialEdges: Edge[] = [];

export const Diagrama: React.FC = () => {
    const [nodes, SetNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, SetEdges, onEdgesChange] = useEdgesState(initialEdges);

    const addNode = () => {
        const newNode: Node = {
            id: (nodes.length + 1).toString(),
            type: 'default',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: `Clase${nodes.length + 1}` },
        };
        SetNodes((nds) => nds.concat(newNode));
    }

    const onConnect = useCallback(
        (params: Edge | Connection) => SetEdges((eds) => addEdge(params, eds)),
        [SetEdges]
    );


    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <Sidebar onAddNode={addNode} />
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                {/* Herramientas */}
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}

