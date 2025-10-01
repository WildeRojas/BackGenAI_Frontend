import React, { useCallback, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { useMemo } from "react";
import { SaveVersionModal } from "../../Components/SaveVersion";
import { CreateProyectoModal } from "../../Components/CreateProyectoModal";
import { getProyectoById } from "../../Services/Proyecto/Proyecto";
import { EditRelationModal } from "./EditarRelation";
import type { ProyectoVersionContenido, UMLClass, UMLRelation, UMLRelationType, proyectos, proyectoVersion } from "../../Interfaces/proyectos";
import "@xyflow/react/dist/style.css";
import { ClassNode } from "./Node";
import type { NodeProps } from "@xyflow/react";
import { SpringBootCodeGenerator } from "../../Services/springBootGenerator";
import { DiagramProvider } from "../../contexts/DiagramContext";
import { Navbar } from "../../Components/Navbar";
import { GeminiModal } from "../../Components/GeminiModal";

import { VersionSelector } from '../../Components/ProyectosList';

// Nodos iniciales vacíos
const initialNodes: Node[] = [];
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
    const { proyectoId } = useParams<{ proyectoId: string }>();
    const navigate = useNavigate();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectNode, setSelectNode] = useState<string | null>(null);
    const [creatingRelation, setCreatingRelation] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showCreateProyectoModal, setShowCreateProyectoModal] = useState(false);
    const [proyecto, setProyecto] = useState<proyectos | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentVersion, setCurrentVersion] = useState<proyectoVersion | null>(null);

    const [relationType, setRelationType] = useState<"association" | "inheritance" | "aggregation" | "composition">("association");

    // Estados para edición de relaciones
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
    const [showEditRelationModal, setShowEditRelationModal] = useState(false);

    // Función para actualizar el nombre y atributos de un nodo
    type NodeDataUpdate = { label?: string; attributes?: { name: string; type: string }[] };
    const updateNodeData = useCallback((nodeId: string, newData: NodeDataUpdate) => {
        setNodes((nds) => nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
        ));
    }, [setNodes]);

    // Memorizar nodeTypes y edgeTypes para evitar warning de React Flow
    const nodeTypes = useMemo(() => ({
        classNode: (props: NodeProps) => <ClassNode {...props} updateNodeData={updateNodeData} />,
    }), [updateNodeData]);

    const edgeTypesMemo = useMemo(() => ({
        association: AssociationEdge,
        inheritance: InheritanceEdge,
        aggregation: AggregationEdge,
        composition: CompositionEdge
    }), []);

    // Cargar el proyecto si hay un ID
    useEffect(() => {
        const loadProyecto = async () => {
            if (proyectoId && !isNaN(Number(proyectoId))) {
                try {
                    setLoading(true);
                    const data = await getProyectoById(Number(proyectoId));
                    setProyecto(data);
                    // No cargar automáticamente la última versión - dejar que el selector lo haga
                } catch (error) {
                    setProyecto(null);
                    console.error("Error cargando el proyecto:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setProyecto(null);
                setLoading(false);
            }
        };
        loadProyecto();
    }, [proyectoId]);


    // Nueva función para cargar una versión específica
    const loadVersion = useCallback((version: proyectoVersion) => {
        setCurrentVersion(version);

        if (version.contenido) {
            const contenido = typeof version.contenido === "string"
                ? JSON.parse(version.contenido)
                : version.contenido;

            const loadedNodes: Node[] = contenido.classes.map((c: UMLClass) => ({
                id: c.id,
                type: "classNode",
                position: { x: c.position.x, y: c.position.y },
                data: { 
                    label: c.nombre, 
                    attributes: c.atributos.map(attr => ({ 
                        name: attr.nombre || attr.name, 
                        type: attr.tipo  || attr.type
                    }))
                }
            }));

            const loadedEdges: Edge[] = contenido.relations.map((r: UMLRelation) => ({
                id: r.id,
                source: r.source,
                target: r.target,
                type: r.type,
                data: {
                    sourceCardinality: r.sourceCardinality || "1",
                    targetCardinality: r.targetCardinality || "*"
                }
            }));

            setNodes(loadedNodes);
            setEdges(loadedEdges);
        }
    }, [setNodes, setEdges]);

    // Función para aplicar un diagrama generado por IA
    const applyGeneratedDiagram = useCallback((classes: UMLClass[], relations: UMLRelation[]) => {
        console.log('Aplicando diagrama generado por IA:', { classes, relations });

        // Convertir las clases UML a nodos de React Flow
        const newNodes: Node[] = classes.map((c) => ({
            id: c.id,
            type: "classNode",
            position: { x: c.position.x, y: c.position.y },
            data: { 
                label: c.nombre, 
                attributes: c.atributos.map(attr => ({ 
                    name: attr.nombre, 
                    type: attr.tipo 
                }))
            }
        }));

        // Convertir las relaciones UML a edges de React Flow
        const newEdges: Edge[] = relations.map((r) => {
            // Encontrar las posiciones de los nodos para calcular los handles óptimos
            const sourceNode = newNodes.find(n => n.id === r.source);
            const targetNode = newNodes.find(n => n.id === r.target);

            let sourceHandle = "source-right";
            let targetHandle = "target-left";

            if (sourceNode && targetNode) {
                const result = getClosestHandles(
                    sourceNode.position.x,
                    sourceNode.position.y,
                    targetNode.position.x,
                    targetNode.position.y
                );
                sourceHandle = result.sourceHandle;
                targetHandle = result.targetHandle;
            }

            return {
                id: r.id,
                source: r.source,
                target: r.target,
                type: r.type,
                sourceHandle,
                targetHandle,
                data: {
                    sourceCardinality: r.sourceCardinality || "1",
                    targetCardinality: r.targetCardinality || "*"
                }
            };
        });

        // Aplicar los nuevos nodos y edges
        setNodes(newNodes);
        setEdges(newEdges);

        console.log('Diagrama aplicado exitosamente:', { newNodes, newEdges });

        // Mostrar mensaje de éxito
        alert(`¡Diagrama aplicado exitosamente! ${classes.length} clases y ${relations.length} relaciones agregadas.`);
    }, [setNodes, setEdges]);

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

    // Handler para click en edge (relación)
    const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
        event.stopPropagation();
        setSelectedEdge(edge);
        setShowEditRelationModal(true);
    }, []);

    // Guardar cambios en la relación
    const handleSaveRelation = useCallback((updatedRelation: UMLRelation) => {
        setEdges(eds => eds.map(e => {
            if (e.id === updatedRelation.id) {
                return {
                    ...e,
                    type: updatedRelation.type,
                    data: {
                        ...e.data,
                        sourceCardinality: updatedRelation.sourceCardinality,
                        targetCardinality: updatedRelation.targetCardinality
                    }
                };
            }
            return e;
        }));
        setShowEditRelationModal(false);
        setSelectedEdge(null);
    }, [setEdges]);

    // Eliminar relación
    const handleDeleteRelation = useCallback(() => {
        if (selectedEdge) {
            setEdges(eds => eds.filter(e => e.id !== selectedEdge.id));
            setShowEditRelationModal(false);
            setSelectedEdge(null);
        }
    }, [selectedEdge, setEdges]);

    const getContenido = (): ProyectoVersionContenido => ({
        classes: nodes.map((n) => ({
            id: n.id,
            nombre: String(n.data.label),
            atributos: Array.isArray(n.data.attributes) ? n.data.attributes : [],
            position: { x: n.position.x, y: n.position.y }
        })),
        relations: edges.map((e) => ({
            id: e.id,
            source: String(e.source),
            target: String(e.target),
            type: (e.type || "association") as UMLRelationType,
            sourceCardinality: typeof e.data?.sourceCardinality === "string" ? e.data.sourceCardinality : undefined,
            targetCardinality: typeof e.data?.targetCardinality === "string" ? e.data.targetCardinality : undefined
        }))
    });

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        if (creatingRelation) {
            if (!selectNode) {
                // Primer nodo seleccionado para la relación
                setSelectNode(node.id);
            } else if (selectNode !== node.id) {
                // Segundo nodo seleccionado, crear relación
                const sourceNode = nodes.find((n) => n.id === selectNode);
                const targetNode = node;
                if (sourceNode && targetNode) {
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
                            sourceCardinality: "1..1",
                            targetCardinality: "1..*"
                        }
                    };
                    setEdges((eds) => addEdge(newEdge, eds));
                }
                // Salir del modo crear relación
                setSelectNode(null);
                setCreatingRelation(false);
            }
        } else {
            // Selección normal de nodo
            setSelectNode(selectNode === node.id ? null : node.id);
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



    // Manejar la creación exitosa de un proyecto
    const handleProyectoCreated = (nuevoProyectoId: number) => {
        // Redirige a la ruta con el nuevo ID
        navigate(`/diseño/${nuevoProyectoId}`);
    };

    // Estado para el modal Gemini
    const [isGeminiOpen, setIsGeminiOpen] = useState(false);

    return (
        <DiagramProvider applyGeneratedDiagram={applyGeneratedDiagram}>
            <div className="flex flex-col w-full h-screen">
                <Navbar />
                {/* Modal Gemini */}
                <GeminiModal
                    isOpen={isGeminiOpen}
                    onClose={() => setIsGeminiOpen(false)}
                    onGenerateDiagram={applyGeneratedDiagram}
                />
                {/* Header con botones de acción */}
                <div className="flex justify-between p-2 bg-gray-100">
                    <div className="flex items-center gap-4">
                        {loading ? (
                            <span className="text-gray-600">Cargando...</span>
                        ) : proyecto ? (
                            <>
                                <span className="font-medium">Proyecto: {proyecto.Titulo}</span>
                                <VersionSelector
                                    proyectoId={proyecto.id}
                                    onVersionSelect={loadVersion}
                                    currentVersion={currentVersion}
                                />
                            </>
                        ) : (
                            <button
                                onClick={() => setShowCreateProyectoModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                            >
                                Crear Proyecto
                            </button>
                        )}
                    </div>
                    <div className="space-x-2">
                        <button
                            onClick={() => setShowSaveModal(true)}
                            className={`px-4 py-2 ${proyectoId && proyecto
                                ? "bg-green-600 text-white"
                                : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                } rounded-md`}
                            disabled={!proyectoId || !proyecto}
                            title={!proyectoId || !proyecto ? "Primero debes crear un proyecto" : "Guardar versión"}
                        >
                            Guardar versión
                        </button>
                        <button
                            onClick={() => SpringBootCodeGenerator(proyecto?.Titulo || "mi-proyecto", getContenido())}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md"
                        >
                            Exportar código
                        </button>
                        <button
                            onClick={() => setIsGeminiOpen(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md"
                        >
                            Generar con IA
                        </button>
                    </div>
                </div>
                <div className="flex-1 flex">
                    {/* Sidebar simple */}
                    <Sidebar onAddNode={addNode} onSelectRelation={(type) => {
                        setRelationType(type as typeof relationType);
                        setCreatingRelation(true);
                    }} />
                    {/* Lienzo principal */}
                    <div className="flex-1">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeClick={onNodeClick}
                            onEdgeClick={onEdgeClick}
                            fitView
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypesMemo}
                            connectionMode={ConnectionMode.Loose}
                        >
                            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                            <Controls />
                            <MiniMap />
                        </ReactFlow>
                    </div>
                </div>

                {/* Modales */}
                {proyecto && (
                    <SaveVersionModal
                        isOpen={showSaveModal}
                        onClose={() => setShowSaveModal(false)}
                        contenido={getContenido()}
                        proyectoId={proyecto.id}
                    />
                )}

                <CreateProyectoModal
                    isOpen={showCreateProyectoModal}
                    onClose={() => setShowCreateProyectoModal(false)}
                    onSuccess={handleProyectoCreated}
                />

                {/* Modal para editar relación */}
                {selectedEdge && (
                    <EditRelationModal
                        isOpen={showEditRelationModal}
                        onClose={() => {
                            setShowEditRelationModal(false);
                            setSelectedEdge(null);
                        }}
                        relation={{
                            id: selectedEdge.id,
                            source: String(selectedEdge.source),
                            target: String(selectedEdge.target),
                            type: (selectedEdge.type || "association") as UMLRelationType,
                            sourceCardinality: typeof selectedEdge.data?.sourceCardinality === "string" ? selectedEdge.data.sourceCardinality : "1",
                            targetCardinality: typeof selectedEdge.data?.targetCardinality === "string" ? selectedEdge.data.targetCardinality : "*"
                        }}
                        onSave={handleSaveRelation}
                        onDelete={handleDeleteRelation}
                    />
                )}
            </div>
        </DiagramProvider>
    );
};
