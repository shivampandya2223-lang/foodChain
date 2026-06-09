"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const premium_dashboard_module_1 = require("./premium-dashboard.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(premium_dashboard_module_1.PremiumDashboardModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PREMIUM_DASHBOARD_PORT') ?? '1310';
    await app.listen(port);
    console.log(`Premium dashboard running on http://localhost:${port}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map