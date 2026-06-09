"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvFilePaths = getEnvFilePaths;
function getEnvFilePaths(appName) {
    return [
        process.env.ENV_FILE,
        `apps/${appName}/.env.local`,
        `apps/${appName}/.env`,
        '.env',
    ].filter(Boolean);
}
//# sourceMappingURL=env-file-paths.js.map