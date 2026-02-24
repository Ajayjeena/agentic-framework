/**
 * Secrets provider: pluggable (Vault, AWS Secrets Manager, env).
 */
export interface SecretsProvider {
    get(key: string): Promise<string | undefined>;
}
//# sourceMappingURL=secrets.d.ts.map