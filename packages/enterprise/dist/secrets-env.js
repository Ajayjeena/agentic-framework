/**
 * Environment-based secrets (process.env); default for development.
 */
export class EnvSecretsProvider {
    async get(key) {
        return process.env[key];
    }
}
//# sourceMappingURL=secrets-env.js.map