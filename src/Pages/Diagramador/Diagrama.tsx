import React, { useCallback, useState } from "react"
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    SmoothStepEdge
} from "@xyflow/react"

import type { Connection, Edge, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css"

import { ClassNode } from "./Node";
import { AssociationEdge, InheritanceEdge, AggregationEdge, CompositionEdge, DependencyEdge } from "./UmlEdges";

const initialNodes: Node[] = [{
    id: '1',
    type: 'classNode',
    position: { x: 200, y: 150 },
    data: { label: 'Alumno', attributes: [] }
},
{ id: '2', type: 'classNode', position: { x: 600, y: 150 }, data: { label: 'Curso', attributes: [] } },
];
import { Sidebar } from "../../Components/Sidebar";

// Define interface para los datos de arista
interface EdgeData {
    relationType: string;
    sourceCardinality: string;
    targetCardinality: string;
    [key: string]: unknown;
}

// Extiende el tipo Edge para incluir datos específicos
interface UmlEdge extends Edge {
    data: EdgeData;
}

const initialEdges: UmlEdge[] = [];

const nodeTypes = {
    classNode: ClassNode,
}

const edgeTypes = {
    default: SmoothStepEdge,
    association: AssociationEdge,
    inheritance: InheritanceEdge,
    aggregation: AggregationEdge,
    composition: CompositionEdge,
    dependency: DependencyEdge,
};

type RelationType = 'association' | 'inheritance' | 'aggregation' | 'dependency' | 'composition';

export const Diagrama: React.FC = () => {
    const [nodes, SetNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, SetEdges, onEdgesChange] = useEdgesState<UmlEdge>(initialEdges);
    const [relationType, setRelationType] = useState<RelationType>('association');
    const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
    
    // Valores por defecto para la cardinalidad
    const defaultSourceCardinality = '1';
    const defaultTargetCardinality = '*';

    // Cuando se selecciona un edge
    const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
        setSelectedEdge(edge.id);
    };

    const onConnect = useCallback(
        (params: Edge | Connection) => {
            const newEdge: UmlEdge = {
                ...params,
                id: `${params.source}-${params.target}-${Date.now()}`,
                type: relationType,
                data: {
                    relationType,
                    sourceCardinality: defaultSourceCardinality,
                    targetCardinality: defaultTargetCardinality,
                },
                markerEnd: {
                    type: 'arrow',
                    color: getEdgeColor(relationType),
                },
                style: {
                    stroke: getEdgeColor(relationType),
                    strokeWidth: 2,
                },
            };
            SetEdges((eds) => addEdge(newEdge, eds));
        },
        [relationType, SetEdges]
    );

    const addNode = () => {
        const newNode: Node = {
            id: (nodes.length + 1).toString(),
            type: 'classNode',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: `Clase${nodes.length + 1}`, attributes: [] },
        };
        SetNodes((nds) => nds.concat(newNode));
    };

    const getEdgeColor = (type: string) => {
        switch (type) {
            case 'inheritance': return '#10b981'; // green
            case 'aggregation': return '#f59e0b'; // amber
            case 'composition': return '#ef4444'; // red
            case 'dependency': return '#8b5cf6'; // purple
            default: return '#3b82f6'; // blue
        }
    };

    const handleRelationTypeChange = (type: string) => {
        setRelationType(type as RelationType);
        // Si hay un edge seleccionado, cambiar su tipo
        if (selectedEdge) {
            SetEdges((eds) => eds.map(e =>
                e.id === selectedEdge 
                ? { 
                    ...e, 
                    type, 
                    data: { 
                        ...e.data, 
                        relationType: type 
                    } 
                } 
                : e
            ));
        }
    }

    const updateEdgeCardinality = (edgeId: string, source: boolean, value: string) => {
        SetEdges(eds => 
            eds.map(edge => {
                if (edge.id === edgeId) {
                    return {
                        ...edge,
                        data: {
                            ...edge.data,
                            ...(source 
                                ? { sourceCardinality: value } 
                                : { targetCardinality: value })
                        }
                    };
                }
                return edge;
            })
        );
    };

    return (
        <div className="flex w-full h-screen">
            <Sidebar 
                onAddNode={addNode} 
                onSelectRelation={handleRelationTypeChange}
            />
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                    minZoom={0.2}
                    maxZoom={2}
                    attributionPosition="bottom-left"
                    proOptions={{ hideAttribution: true }}
                    onEdgeClick={onEdgeClick}
                >
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    <Controls />
                    <MiniMap />
                </ReactFlow>

                {/* Menú contextual para edge seleccionado */}
                {selectedEdge && (
                    <div className="absolute left-1/2 top-8 z-50 flex flex-col items-center transform -translate-x-1/2">
                        <div className="bg-white border shadow-lg rounded-lg px-4 py-2 flex flex-col gap-2">
                            <div className="flex gap-2 items-center">
                                <button
                                    className="text-red-600 hover:underline"
                                    onClick={() => {
                                        SetEdges((eds) => eds.filter(e => e.id !== selectedEdge));
                                        setSelectedEdge(null);
                                    }}
                                >
                                    Eliminar relación
                                </button>
                                <span className="text-gray-400">|</span>
                                <select
                                    className="border rounded px-2 py-1 text-sm"
                                    value={edges.find(e => e.id === selectedEdge)?.type || 'association'}
                                    onChange={e => handleRelationTypeChange(e.target.value)}
                                >
                                    <option value="association">Asociación</option>
                                    <option value="aggregation">Agregación</option>
                                    <option value="composition">Composición</option>
                                    <option value="inheritance">Herencia</option>
                                    <option value="dependency">Dependencia</option>
                                </select>
                                <button
                                    className="text-gray-600 hover:underline"
                                    onClick={() => setSelectedEdge(null)}
                                >
                                    Cerrar
                                </button>
                            </div>
                            
                            {/* Cardinalidad */}
                            <div className="flex gap-4 pt-1 border-t">
                                <div className="flex items-center gap-1">
                                    <label className="text-xs text-gray-600">Origen:</label>
                                    <input 
                                        className="border rounded px-2 py-1 text-sm w-16"
                                        value={edges.find(e => e.id === selectedEdge)?.data.sourceCardinality || defaultSourceCardinality} 
                                        onChange={(e) => {
                                            updateEdgeCardinality(selectedEdge, true, e.target.value);
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <label className="text-xs text-gray-600">Destino:</label>
                                    <input 
                                        className="border rounded px-2 py-1 text-sm w-16"
                                        value={edges.find(e => e.id === selectedEdge)?.data.targetCardinality || defaultTargetCardinality} 
                                        onChange={(e) => {
                                            updateEdgeCardinality(selectedEdge, false, e.target.value);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Indicador del tipo de relación actual */}
                <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md border">
                    <span className="text-sm text-gray-600">Tipo de relación:</span>
                    <span className="ml-2 font-medium text-blue-600 capitalize">{relationType}</span>
                </div>
            </div>
        </div>
    );
};