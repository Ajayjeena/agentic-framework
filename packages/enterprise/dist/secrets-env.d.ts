import type { SecretsProvider } from "./secrets.js";
/**
 * Environment-based secrets (process.env); default for development.
 */
export declare class EnvSecretsProvider implements SecretsProvider {
    get(key: string): Promise<string | undefined>;
}
//# sourceMappingURL=secrets-env.d.ts.map