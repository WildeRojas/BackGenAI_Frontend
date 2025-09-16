import type { usuario } from "../../Interfaces/user";
import api from "../axios";

interface registerData {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password2: string;
}

export const registrar = async (data: registerData): Promise<usuario> => {
    const response = await api.post<usuario>("/auth/registrar/", data);
    return response.data;
}