import { createContext, useContext } from 'react';
import type { UMLClass, UMLRelation } from '../Interfaces/proyectos';

export interface DiagramContextType {
  applyGeneratedDiagram?: (classes: UMLClass[], relations: UMLRelation[]) => void;
}

export const DiagramContext = createContext<DiagramContextType>({});

export const useDiagram = () => {
  return useContext(DiagramContext);
};