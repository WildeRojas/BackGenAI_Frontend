import api from "../axios";
import type { proyectos } from "../../Interfaces/proyectos";

export const getProyectos = async () => {
    const response = await api.get('proyects/proyectos/');
    return response.data;
}

export const crearProyecto = async (data: proyectos) => {
    const response = await api.post('proyects/proyectos/', data);
    return response.data;
}