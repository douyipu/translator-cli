export function getEnvVariable(name: string): string {
    const value = process.env[name];
    if (!value) {
        console.warn(`Warning: Environment variable ${name} is not set`);
        return "";
    }
    return value;
}