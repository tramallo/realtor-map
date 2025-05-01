/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_MAPS_API_KEY: string;
    readonly VITE_GOOGLE_MAPS_TILES_API_KEY: string;
    readonly VITE_REALTOR_MAP_SERVICE_URL: string;
    readonly VITE_SUPABASE_PROJECT_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}