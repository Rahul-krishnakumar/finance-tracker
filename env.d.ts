/// <reference types="bun" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  readonly GOOGLE_PRIVATE_KEY: string;
  readonly SHEET_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
