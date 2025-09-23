import type { usuario } from "./user";

export interface proyectos {
    id: number;
    nombre: string;
    descripcion: string;
    User: usuario;
    Fecha_creacion: Date;
    Fecha_actualizacion: Date;
}