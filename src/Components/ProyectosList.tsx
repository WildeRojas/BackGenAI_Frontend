import React, { useState, useEffect } from 'react';
import { getVersiones } from '../Services/Proyecto/Proyecto_Version';
import type { proyectoVersion } from '../Interfaces/proyectos';

interface VersionSelectorProps {
  proyectoId: number;
  onVersionSelect: (version: proyectoVersion) => void;
  currentVersion?: proyectoVersion | null;
}

export const VersionSelector: React.FC<VersionSelectorProps> = ({ 
  proyectoId, 
  onVersionSelect, 
  currentVersion 
}) => {
  const [versions, setVersions] = useState<proyectoVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVersions = async () => {
      try {
        setLoading(true);
        const data = await getVersiones(proyectoId);
        setVersions(data);
        
        // Si no hay versión seleccionada, seleccionar la más reciente
        if (!currentVersion && data.length > 0) {
          onVersionSelect(data[0]); // La primera es la más reciente
        }
      } catch (error) {
        console.error('Error cargando versiones:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVersions();
  }, [proyectoId, onVersionSelect, currentVersion]);

  if (loading) return <span className="text-gray-500">Cargando versiones...</span>;
  if (versions.length === 0) return <span className="text-gray-500">Sin versiones guardadas</span>;

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">Versión:</label>
      <select
        value={currentVersion?.id || ''}
        onChange={(e) => {
          const selectedVersion = versions.find(v => v.id === Number(e.target.value));
          if (selectedVersion) onVersionSelect(selectedVersion);
        }}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      >
        {versions.map((version) => (
          <option key={version.id} value={version.id}>
            v{version.Version} ({version.Fecha_Creacion ? new Date(version.Fecha_Creacion).toLocaleDateString() : ''})
          </option>
        ))}
      </select>
    </div>
  );
};