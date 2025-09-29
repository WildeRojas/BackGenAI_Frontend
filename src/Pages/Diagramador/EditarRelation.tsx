import { useState } from "react";
import type { UMLRelation } from "../../Interfaces/proyectos";

interface EditRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  relation: UMLRelation; 
  onSave: (updatedRelation: UMLRelation) => void;
  onDelete?: () => void;
}

export const EditRelationModal: React.FC<EditRelationModalProps> = ({
  isOpen,
  onClose,
  relation,
  onSave,
  onDelete,
}) => {
  const [relationType, setRelationType] = useState(relation.type);
  const [cardinalitySource, setCardinalitySource] = useState(relation.sourceCardinality || "1");
  const [cardinalityTarget, setCardinalityTarget] = useState(relation.targetCardinality || "*");

  const handleSave = () => {
    const updatedRelation = {
      ...relation,
      sourceCardinality: cardinalitySource,
      targetCardinality: cardinalityTarget,
      type: relationType,
    };
    onSave(updatedRelation); // Llamar a onSave con la relación actualizada
    onClose(); // Cerrar el modal después de guardar
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Relación</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium">Tipo de relación</label>
          <select
            value={relationType}
            onChange={(e) => setRelationType(e.target.value as "association" | "inheritance" | "aggregation" | "composition")}
            className="w-full p-2 border rounded-md"
          >
            <option value="association">Asociación</option>
            <option value="inheritance">Herencia</option>
            <option value="aggregation">Agregación</option>
            <option value="composition">Composición</option>
          </select>
        </div>

        {/* Solo mostrar cardinalidad para asociación */}
        {relationType === "association" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium">Cardinalidad (origen)</label>
              <select
                value={cardinalitySource}
                onChange={(e) => setCardinalitySource(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="1..1">1..1</option>
                <option value="0..*">0..*</option>
                <option value="0..1">0..1</option>
                <option value="1..*">1..*</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Cardinalidad (destino)</label>
              <select
                value={cardinalityTarget}
                onChange={(e) => setCardinalityTarget(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="1..1">1..1</option>
                <option value="0..*">0..*</option>
                <option value="0..1">0..1</option>
                <option value="1..*">1..*</option>
              </select>
            </div>
          </>
        )}

        {/* Mensaje explicativo para otros tipos de relación */}
        {relationType !== "association" && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              Para relaciones de {relationType === "inheritance" ? "herencia" : 
                relationType === "aggregation" ? "agregación" : "composición"}, 
              la flecha indica automáticamente dónde va el ID como clave foránea.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Eliminar
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
