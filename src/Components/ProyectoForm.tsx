import React, { useState } from 'react';
import { createProyecto } from '../Services/Proyecto/Proyecto';
import type { ProyectoCreate } from '../Interfaces/proyectos';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProyectoFormProps {
  onSuccess?: (proyectoId: number) => void;
  onCancel?: () => void;
}

export const ProyectoForm: React.FC<ProyectoFormProps> = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proyecto, setProyecto] = useState<Omit<ProyectoCreate, 'User'>>({
    id: 0,
    Titulo: '',
    Descripcion: '',
  });

  const CrearProyecto = async () => {
    setLoading(true);
    setError(null);
    try {
      const newProyecto = await createProyecto({
        ...proyecto,
        User: user?.id || 0
      });
      setLoading(false);
      onSuccess?.(newProyecto.id);
      console.log(newProyecto);
      navigate(`/diseño/${newProyecto.id}`);
    } catch (error) {
      setLoading(false);
      console.log(error);
      setError('Error al crear el proyecto. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <span className="mb-4 block font-semibold">
          Titulo
          <input 
            className="border border-gray-300 p-2 rounded w-full"
            type="text" 
            value={proyecto.Titulo}
            onChange={(e) => setProyecto({ ...proyecto, Titulo: e.target.value })}
          />
        </span>
        <span className="mb-4 block font-semibold">
          Descripcion
          <input 
            className="border border-gray-300 p-2 rounded w-full"
            type="text" 
            value={proyecto.Descripcion}
            onChange={(e) => setProyecto({ ...proyecto, Descripcion: e.target.value })}
          />
        </span>
        <div className="mt-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={CrearProyecto}
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Proyecto'}
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors ml-2"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
        {error && (
          <div className="mt-4 text-red-600 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
};