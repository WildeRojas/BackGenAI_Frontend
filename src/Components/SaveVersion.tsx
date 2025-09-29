import React, { useState } from 'react';
import { createVersionLegacy } from '../Services/Proyecto/Proyecto_Version';
import type { ProyectoVersionContenido } from '../Interfaces/proyectos';

interface SaveVersionProps {
  proyectoId: number;
  contenido: ProyectoVersionContenido;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const SaveVersionButton: React.FC<SaveVersionProps> = ({
  proyectoId,
  contenido,
  onSuccess,
  onError
}) => {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!proyectoId) {
      onError?.('ID de proyecto no válido');
      return;
    }

    try {
      setSaving(true);
      await createVersionLegacy(proyectoId, contenido);
      onSuccess?.();
    } catch (error) {
      console.error('Error al guardar la versión:', error);
      onError?.('Error al guardar la versión del proyecto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className={`px-4 py-2 rounded-md transition-colors ${
        saving
          ? 'bg-gray-400 text-gray-700'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {saving ? 'Guardando...' : 'Guardar Cambios'}
    </button>
  );
};

interface SaveVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  proyectoId: number;
  contenido: ProyectoVersionContenido;
  onSuccess?: () => void;
}

export const SaveVersionModal: React.FC<SaveVersionModalProps> = ({
  isOpen,
  onClose,
  proyectoId,
  contenido,
  onSuccess
}) => {
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!proyectoId) {
      setError('ID de proyecto no válido');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await createVersionLegacy(proyectoId, contenido, nombre.trim() || undefined);
      onSuccess?.();
      onClose();
      console.log("datos mandados:", { proyectoId, contenido, nombre: nombre.trim() || undefined });
    } catch (err) {
      console.error('Error al guardar versión:', err);
      setError('Error al guardar la versión del proyecto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Guardar Versión</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="nombre" className="block text-gray-700 font-medium mb-2">
            Nombre de la versión (opcional)
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Versión inicial"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};