import React from 'react';
import { ProyectoForm } from './ProyectoForm';

interface CreateProyectoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (proyectoId: number) => void;
}

export const CreateProyectoModal: React.FC<CreateProyectoModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess
}) => {
  if (!isOpen) return null;

  const handleSuccess = (proyectoId: number) => {
    if (onSuccess) {
      onSuccess(proyectoId);
    }
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Nuevo Proyecto</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <ProyectoForm 
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};