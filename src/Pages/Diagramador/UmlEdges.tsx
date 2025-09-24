import React from "react";
import { getSmoothStepPath  } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";


// Asociación: línea simple con cardinalidad mejorada
export const AssociationEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
  });

  return (
    <g>
      <path d={edgePath} stroke="black" strokeWidth={2} fill="none" />

      {/* Cardinalidades */}
      <text
        x={(props.sourceX * 3 + props.targetX) / 4}
        y={(props.sourceY * 3 + props.targetY) / 4 - 5}
        fontSize={12}
        fill="black"
      >
        {String(props.data?.sourceCardinality || "1")}
      </text>
      <text
        x={(props.targetX * 3 + props.sourceX) / 4}
        y={(props.targetY * 3 + props.sourceY) / 4 - 5}
        fontSize={12}
        fill="black"
      >
        {String(props.data?.targetCardinality || "*")}
      </text>
    </g>
  );
};

export const InheritanceEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getSmoothStepPath ({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  return (
    <g>
      <defs>
        <marker
          id="inheritance-arrow"
          markerWidth="20"
          markerHeight="20"
          refX="18"  // 👈 empuja la flecha fuera del nodo
          refY="10"
          orient="auto"
        >
          <path d="M0,0 L18,10 L0,20 Z" fill="white" stroke="black" />
        </marker>
      </defs>
      <path
        d={edgePath}
        stroke="black"
        strokeWidth={2}
        fill="none"
        strokeDasharray="6,6"
        markerEnd="url(#inheritance-arrow)" // 👈 flecha en el destino
      />
    </g>
  );
};

/* ========== Agregación ==========
   Rombo vacío en el TARGET
*/
export const AggregationEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getSmoothStepPath ({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  return (
    <g>
      <defs>
        <marker
          id="aggregation-diamond"
          markerWidth="25"
          markerHeight="25"
          refX="22"  
          refY="12"
          orient="auto"
        >
          <path d="M12,0 L24,12 L12,24 L0,12 Z" fill="white" stroke="black" />
        </marker>
      </defs>
      <path
        d={edgePath}
        stroke="black"
        strokeWidth={2}
        fill="none"
        markerEnd="url(#aggregation-diamond)" 
      />
    </g>
  );
};

/* ========== Composición ==========
   Rombo negro en el TARGET
*/
export const CompositionEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  return (
    <g>
      <defs>
        <marker
          id="composition-diamond"
          markerWidth="25"
          markerHeight="25"
          refX="22"
          refY="12"
          orient="auto"
        >
          <path d="M12,0 L24,12 L12,24 L0,12 Z" fill="black" stroke="black" />
        </marker>
      </defs>
      <path
        d={edgePath}
        stroke="black"
        strokeWidth={2}
        fill="none"
        markerEnd="url(#composition-diamond)" 
      />
    </g>
  );
};