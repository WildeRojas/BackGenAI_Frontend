import React, { useState } from "react";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

interface Attribe {
  name: string;
  type: string;
}

interface NodeDataUpdate {
  label?: string;
  attributes?: Attribe[];
}
interface ClassNodeProps extends NodeProps {
  updateNodeData?: (nodeId: string, newData: NodeDataUpdate) => void;
}

export const ClassNode: React.FC<ClassNodeProps> = ({ id, data, updateNodeData }) => {
  const [className, setClassName] = useState(
    typeof data.label === "string" ? data.label : "NuevaClase"
  );
  const [attributes, setAttributes] = useState<Attribe[]>(
    Array.isArray(data.attributes) ? data.attributes : []
  );

  const handleAddAttribute = () => {
    const newAttrs = [...attributes, { name: "atributo", type: "string" }];
    setAttributes(newAttrs);
    if (updateNodeData) {
      updateNodeData(id, { attributes: newAttrs });
    }
  };

  const handleAttrChange = (
    index: number,
    field: keyof Attribe,
    value: string
  ) => {
    const newAttrs = [...attributes];
    newAttrs[index][field] = value;
    setAttributes(newAttrs);
    if (updateNodeData) {
      updateNodeData(id, { attributes: newAttrs });
    }
  };

  const handleClassNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setClassName(newName);
    if (updateNodeData) {
      updateNodeData(id, { label: newName });
    }
  };

  return (
    <div className="bg-white border-s2 border-gray-400 rounded-lg shadow-md min-w-[220px] relative">
      {/* Bordes completos conectables */}
      <Handle type="source" position={Position.Right} id="source-right" />
      <Handle type="source" position={Position.Left} id="source-left" />
      <Handle type="source" position={Position.Top} id="source-top" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" />
      
      <Handle type="target" position={Position.Right} id="target-right" />
      <Handle type="target" position={Position.Left} id="target-left" />
      <Handle type="target" position={Position.Top} id="target-top" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" />
      {/* Nombre de la clase */}
      <div className="bg-gray-200 px-3 py-1 font-bold text-center border-b">
        <input
          type="text"
          value={className}
          onChange={handleClassNameChange}
          className="bg-transparent w-full text-center font-bold outline-none"
        />
      </div>

      {/* Atributos */}
      <div className="px-3 py-2">
        {attributes.map((attr, index) => (
          <div key={index} className="flex gap-2 items-center mb-1">
            <input
              type="text"
              value={attr.name}
              onChange={(e) => handleAttrChange(index, "name", e.target.value)}
              className="w-full text-sm border-b outline-none"
              style={{ minWidth: "100px" }}
            />
            <select
              value={attr.type}
              onChange={(e) => handleAttrChange(index, "type", e.target.value)}
              className="text-sm border rounded px-1"
            >
              <option value="string">String</option>
              <option value="Int">Int</option>
              <option value="float">Float</option>
              <option value="boolean">boolean</option>
              <option value="date">date</option>
            </select>
          </div>
        ))}
        <button
          onClick={handleAddAttribute}
          className="text-blue-600 text-sm mt-2 hover:underline"
        >
          + Agregar atributo
        </button>
      </div>
    </div>
  );
};
