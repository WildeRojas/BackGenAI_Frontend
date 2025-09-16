export interface usuario {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

export interface userProfile {
    perfil : usuario;
}
