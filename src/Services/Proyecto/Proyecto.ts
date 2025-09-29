import api from "../axios";
import type { proyectos, ProyectoCreate } from "../../Interfaces/proyectos";

export const getProyectos = async (): Promise<proyectos[]> => {
    const { data } = await api.get("/projects/proyectos");
    return data;
};

export const getProyectoById = async (id: number): Promise<proyectos> => {
    const { data } = await api.get(`/projects/proyectos/${id}/`);
    return data;
};

export const createProyecto = async (nuevoProyecto: ProyectoCreate): Promise<proyectos> => {
    const { data } = await api.post("/projects/proyectos/", nuevoProyecto);
    return data;
};

export const updateProyecto = async (id: number, proyecto: Partial<ProyectoCreate>): Promise<proyectos> => {
    const { data } = await api.put(`/projects/proyectos/${id}/`, proyecto);
    return data;
};

export const deleteProyecto = async (id: number): Promise<void> => {
    await api.delete(`/projects/proyectos/${id}/`);
};
