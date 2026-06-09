"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const admin_dashboard_module_1 = require("./admin-dashboard.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(admin_dashboard_module_1.AdminDashboardModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('ADMIN_DASHBOARD_PORT') ?? '1309';
    app.enableCors();
    await app.listen(port);
    console.log(`Admin dashboard running on http://localhost:${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map