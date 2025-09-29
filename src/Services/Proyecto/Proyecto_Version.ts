import api from "../axios";
import type { proyectoVersion, ProyectoVersionContenido, ProyectoVersionCreate } from "../../Interfaces/proyectos";


export const getVersiones = async (proyectoId: number): Promise<proyectoVersion[]> => {
    const { data } = await api.get(`/projects/proyecto-version/?proyecto=${proyectoId}`);
    return data;
};

export const getVersionById = async (id: number): Promise<proyectoVersion> => {
    const { data } = await api.get(`/projects/proyecto-version/${id}/`);
    return data;
};


export const getLatestVersion = async (proyectoId: number): Promise<proyectoVersion> => {
    const versiones = await getVersiones(proyectoId);
    if (!versiones.length) {
        throw new Error('No hay versiones disponibles para este proyecto');
    }

    return versiones.sort((a, b) => b.id - a.id)[0];
};


export const createVersion = async (
    versionData: ProyectoVersionCreate
): Promise<proyectoVersion> => {
    const { data } = await api.post("/projects/proyecto-version/", {
        Version: versionData.nombre || "v1",
        contenido: JSON.stringify(versionData.contenido),
        Proyecto: versionData.proyecto
    });
    return data;
};

export const createVersionLegacy = async (
    proyectoId: number,
    contenido: ProyectoVersionContenido,
    nombre?: string
): Promise<proyectoVersion> => {
    const { data } = await api.post("/projects/proyecto-version/", {
        Version: nombre || "v1",
        contenido: JSON.stringify(contenido),
        Proyecto: proyectoId
    });
    return data;
};

export const updateVersion = async (
    id: number,
    contenido: ProyectoVersionContenido
): Promise<proyectoVersion> => {
    const { data } = await api.put(`/projects/proyecto-version/${id}/`, { contenido });
    return data;
};

export const deleteVersion = async (id: number): Promise<void> => {
    await api.delete(`/projects/proyecto-version/${id}/`);
};
