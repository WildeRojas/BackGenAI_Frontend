import type { usuario } from "./user";

export interface ProyectoCreate {
    id: number;
    Titulo: string;
    Descripcion: string;
    User: number;  
}


export interface ProyectoVersionCreate {
    proyecto: number;
    nombre?: string;
    contenido: ProyectoVersionContenido;
}

export interface proyectoVersion {
    id: number;
    Proyecto: number | proyectos;
    Version: string;
    contenido: ProyectoVersionContenido | string;
    Fecha_Creacion?: Date;
    Fecha_Actualizacion?: Date;
}


export interface proyectos {
    id: number;
    Titulo: string;
    Descripcion: string;
    User: usuario | number;
    Fecha_Creacion?: Date;
    Fecha_Actualizacion?: Date;
}

export interface UMLAttribute {
    nombre: string;
    tipo: "string" | "Int" | "float" | "boolean" | "date" | string;
    name : string;
    type: "string" | "Int" | "float" | "boolean" | "date" | string;
}

export interface UMLClass {
    id: string;
    nombre: string;
    atributos: UMLAttribute[]
    position: {
        x: number;
        y: number;
    }
}

export type UMLRelationType = 
    | "association"
    | "inheritance"
    | "aggregation"
    | "composition";

export interface UMLRelation {
    id: string;
    source: string;
    target: string;
    type: UMLRelationType;
    sourceCardinality?: string;
    targetCardinality?: string;
}

export interface ProyectoVersionContenido {
    classes: UMLClass[];
    relations: UMLRelation[];
}

export interface ProyectoVersionCreate {
    proyecto: number;
    nombre?: string;
    contenido: ProyectoVersionContenido;
}

export interface proyectoVersion {
    id: number;
    Proyecto: number | proyectos;
    Version: string;
    contenido: ProyectoVersionContenido | string;
    Fecha_Creacion?: Date;
    Fecha_Actualizacion?: Date;
}


