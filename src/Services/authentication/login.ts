import api from "../axios";

interface LoginResponse {
    refresh: string;
    access: string;
    user: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
    }
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post("auth/login/", {
        email,
        password
    });
    return response.data;
}

export const isLoggedIn = (): boolean => {
    const token = localStorage.getItem("access");
    return !!token;
}

export const ProfileUser = async () => {
    const response = await api.get("auth/profile/");
    return response.data;
}