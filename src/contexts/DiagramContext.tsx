import React from 'react';
import type { ReactNode } from 'react';
import type { UMLClass, UMLRelation } from '../Interfaces/proyectos';
import { DiagramContext } from './DiagramContextUtils';

interface DiagramProviderProps {
  children: ReactNode;
  applyGeneratedDiagram?: (classes: UMLClass[], relations: UMLRelation[]) => void;
}

export const DiagramProvider: React.FC<DiagramProviderProps> = ({ 
  children, 
  applyGeneratedDiagram 
}) => {
  return (
    <DiagramContext.Provider value={{ applyGeneratedDiagram }}>
      {children}
    </DiagramContext.Provider>
  );
};