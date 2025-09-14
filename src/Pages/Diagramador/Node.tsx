import React, { useState } from "react";
import type { NodeProps } from "@xyflow/react";

interface Attribe {
  name: string;
  type: string;
}

export const ClassNode: React.FC<NodeProps> = ({ data }) => {
  const [className, setClassName] = useState(
    typeof data.label === "string" ? data.label : "NuevaClase"
  );
  const [attributes, setAttributes] = useState<Attribe[]>(
    Array.isArray(data.attributes) ? data.attributes : []
  );


  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: "atributo", type: "tipo" }]);
  };

  const handleAttrChange = (index: number, field: keyof Attribe, value: string) => {
    const newAttrs = [...attributes];
    newAttrs[index][field] = value;
    setAttributes(newAttrs);
  }

  return (
    <div className="bg-white border-2 border-gray-400 rounded-lg shadow-md min-w-[220px]">
      {/* Nombre de la clase */}
      <div className="bg-gray-200 px-3 py-1 font-bold text-center border-b">
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
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