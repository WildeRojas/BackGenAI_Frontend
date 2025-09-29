export type DatabaseType = 
'h2'|
'PostgreSQL' | 
'MySQL' | 
'SQLite' | 
'MongoDB';

export interface propertiesOptions { 
    appName: string;
    port: number | string;
    db?: {
        type: DatabaseType;
        name: string;
        port?: number | string;
        user?: string;
        password?: string;
    }
}