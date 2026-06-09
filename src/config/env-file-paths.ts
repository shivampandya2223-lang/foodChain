export function getEnvFilePaths(appName: string) {
  return [
    process.env.ENV_FILE,
    `apps/${appName}/.env.local`,
    `apps/${appName}/.env`,
    '.env',
  ].filter(Boolean) as string[];
}
