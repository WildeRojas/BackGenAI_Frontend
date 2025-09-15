import React from "react";
import { getBezierPath } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";

// Asociación: línea simple (sin flecha)
export const AssociationEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getBezierPath(props);
  const sourceCard = props.data?.sourceCardinality || '';
  const targetCard = props.data?.targetCardinality || '';
  
  // Calcular la dirección de la conexión
  const dx = props.targetX - props.sourceX;
  const dy = props.targetY - props.sourceY;
  const angle = Math.atan2(dy, dx);
  
  return (
    <g>
      <path d={edgePath} stroke="#3b82f6" strokeWidth={2} fill="none" />
      {/* Cardinalidad en los extremos */}
      {sourceCard && (
        <text 
          x={props.sourceX - 20 * Math.cos(angle)} 
          y={props.sourceY - 20 * Math.sin(angle) - 5} 
          fontSize={12} 
          fill="#3b82f6" 
          textAnchor="middle"
        >{String(sourceCard)}</text>
      )}
      {targetCard && (
        <text 
          x={props.targetX - 20 * Math.cos(angle)} 
          y={props.targetY - 20 * Math.sin(angle) - 5} 
          fontSize={12} 
          fill="#3b82f6" 
          textAnchor="middle"
        >{String(targetCard)}</text>
      )}
    </g>
  );
};

// Herencia: triángulo vacío en el target
export const InheritanceEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getBezierPath(props);
  const sourceCard = props.data?.sourceCardinality || '';
  const targetCard = props.data?.targetCardinality || '';
  
  // Calcular la dirección de la conexión
  const dx = props.targetX - props.sourceX;
  const dy = props.targetY - props.sourceY;
  const angle = Math.atan2(dy, dx);
  
  // Calcular puntos del triángulo según la dirección
  const length = 16;
  const width = 8;
  const targetPointX = props.targetX;
  const targetPointY = props.targetY;
  const p1x = targetPointX - length * Math.cos(angle);
  const p1y = targetPointY - length * Math.sin(angle);
  const p2x = p1x - width * Math.sin(angle);
  const p2y = p1y + width * Math.cos(angle);
  const p3x = p1x + width * Math.sin(angle);
  const p3y = p1y - width * Math.cos(angle);
  
  return (
    <g>
      <path d={edgePath} stroke="#10b981" strokeWidth={2} fill="none" />
      {/* Triángulo en el final orientado según la dirección */}
      <polygon
        points={`${p2x},${p2y} ${targetPointX},${targetPointY} ${p3x},${p3y}`}
        fill="white"
        stroke="#10b981"
        strokeWidth={2}
      />
      {sourceCard && (
        <text 
          x={props.sourceX - 20 * Math.cos(angle)} 
          y={props.sourceY - 20 * Math.sin(angle) - 5} 
          fontSize={12} 
          fill="#10b981" 
          textAnchor="middle"
        >{String(sourceCard)}</text>
      )}
      {targetCard && (
        <text 
          x={props.targetX - 20 * Math.cos(angle)} 
          y={props.targetY - 20 * Math.sin(angle) - 5} 
          fontSize={12} 
          fill="#10b981" 
          textAnchor="middle"
        >{String(targetCard)}</text>
      )}
    </g>
  );
};

// Agregación: rombo vacío en el inicio
export const AggregationEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getBezierPath(props);
  const sourceCard = props.data?.sourceCardinality || '';
  const targetCard = props.data?.targetCardinality || '';
  
  // Calcular la dirección de la conexión
  const dx = props.targetX - props.sourceX;
  const dy = props.targetY - props.sourceY;
  const angle = Math.atan2(dy, dx);
  
  // Calcular puntos del rombo según la dirección
  const length = 12;
  const width = 6;
  const sourcePointX = props.sourceX;
  const sourcePointY = props.sourceY;
  const p1x = sourcePointX + length * Math.cos(angle);
  const p1y = sourcePointY + length * Math.sin(angle);
  const p2x = sourcePointX + width * Math.sin(angle);
  const p2y = sourcePointY - width * Math.cos(angle);
  const p3x = sourcePointX - width * Math.sin(angle);
  const p3y = sourcePointY + width * Math.cos(angle);
  
  return (
    <g>
      <path d={edgePath} stroke="#f59e0b" strokeWidth={2} fill="none" />
      {/* Rombo vacío en el inicio orientado según la dirección */}
      <polygon
        points={`${sourcePointX},${sourcePointY} ${p2x},${p2y} ${p1x},${p1y} ${p3x},${p3y}`}
        fill="white"
        stroke="#f59e0b"
        strokeWidth={2}
      />
      {sourceCard && (
        <text 
          x={props.sourceX - 20 * Math.cos(angle)} 
          y={props.sourceY - 20 * Math.sin(angle) - 5} 
          fontSize={12} 
          fill="#f59e0b" 
          textAnchor="middle"
        >{String(sourceCard)}</text>
      )}
      {targetCard && (
        <text 
          x={props.targetX - 20 * Math.cos(angle)} 
          y={props.targetY - 20 * Math.sin(angle) - 5} 
          fontSize={12} 
          fill="#f59e0b" 
          textAnchor="middle"
        >{String(targetCard)}</text>
      )}
    </g>
  );
};

// Composición: rombo negro en el inicio
export const CompositionEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getBezierPath(props);
  const sourceCard = props.data?.sourceCardinality || '';
  const targetCard = props.data?.targetCardinality || '';
  
  // Calcular la dirección de la conexión
  const dx = props.targetX - props.sourceX;
  const dy = props.targetY - props.sourceY;
  const angle = Math.atan2(dy, dx);
  
  // Calcular puntos del rombo según la dirección
  const length = 12;
  const width = 6;
  const sourcePointX = props.sourceX;
  const sourcePointY = props.sourceY;
  const p1x = sourcePointX + length * Math.cos(angle);
  const p1y = sourcePointY + length * Math.sin(angle);
  const p2x = sourcePointX + width * Math.sin(angle);
  const p2y = sourcePointY - width * Math.cos(angle);
  const p3x = sourcePointX - width * Math.sin(angle);
  const p3y = sourcePointY + width * Math.cos(angle);
  
  return (
    <g>
      <path d={edgePath} stroke="#ef4444" strokeWidth={2} fill="none" />
      {/* Rombo negro en el inicio orientado según la dirección */}
      <polygon
        points={`${sourcePointX},${sourcePointY} ${p2x},${p2y} ${p1x},${p1y} ${p3x},${p3y}`}
        fill="#ef4444"
        stroke="#ef4444"
        strokeWidth={2}
      />
      {sourceCard && (
        <text 
          x={props.sourceX - 20 * Math.cos(angle)} 
          y={props.sourceY - 20 * Math.sin(angle) - 5} 
          fontSize={12} 
          fill="#ef4444" 
          textAnchor="middle"
        >{String(sourceCard)}</text>
      )}
      {targetCard && (
        <text 
          x={props.targetX - 20 * Math.cos(angle)} 
          y={props.targetY - 20 * Math.sin(angle) - 5} 
          fontSize={12} 
          fill="#ef4444" 
          textAnchor="middle"
        >{String(targetCard)}</text>
      )}
    </g>
  );
};

// Dependencia: línea punteada con triángulo vacío en el target
export const DependencyEdge: React.FC<EdgeProps> = (props) => {
  const [edgePath] = getBezierPath(props);
  const sourceCard = props.data?.sourceCardinality || '';
  const targetCard = props.data?.targetCardinality || '';
  
  // Calcular la dirección de la conexión
  const dx = props.targetX - props.sourceX;
  const dy = props.targetY - props.sourceY;
  const angle = Math.atan2(dy, dx);
  
  // Calcular puntos del triángulo según la dirección
  const length = 16;
  const width = 8;
  const targetPointX = props.targetX;
  const targetPointY = props.targetY;
  const p1x = targetPointX - length * Math.cos(angle);
  const p1y = targetPointY - length * Math.sin(angle);
  const p2x = p1x - width * Math.sin(angle);
  const p2y = p1y + width * Math.cos(angle);
  const p3x = p1x + width * Math.sin(angle);
  const p3y = p1y - width * Math.cos(angle);
  
  return (
    <g>
      <path d={edgePath} stroke="#8b5cf6" strokeWidth={2} fill="none" strokeDasharray="5,5" />
      {/* Triángulo en el final orientado según la dirección */}
      <polygon
        points={`${p2x},${p2y} ${targetPointX},${targetPointY} ${p3x},${p3y}`}
        fill="white"
        stroke="#8b5cf6"
        strokeWidth={2}
      />
      {sourceCard && (
        <text 
          x={props.sourceX - 20 * Math.cos(angle)} 
          y={props.sourceY - 20 * Math.sin(angle) - 5} 
          fontSize={12} 
          fill="#8b5cf6" 
          textAnchor="middle"
        >{String(sourceCard)}</text>
      )}
      {targetCard && (
        <text 
          x={props.targetX - 20 * Math.cos(angle)} 
          y={props.targetY - 20 * Math.sin(angle) - 5} 
          fontSize={12} 
          fill="#8b5cf6" 
          textAnchor="middle"
        >{String(targetCard)}</text>
      )}
    </g>
  );
};
