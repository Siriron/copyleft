/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS_BRADBURY: string;
  readonly VITE_CONTRACT_ADDRESS_STUDIONET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
