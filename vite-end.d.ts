/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_WEBSOCKET_URI: string;
    readonly VITE_API_URI: string;
}
  
interface ImportMeta {
    readonly env: ImportMetaEnv;
}
  