import type { SecretsProvider } from "./secrets.js";

/**
 * Environment-based secrets (process.env); default for development.
 */
export class EnvSecretsProvider implements SecretsProvider {
  async get(key: string): Promise<string | undefined> {
    return process.env[key];
  }
}
