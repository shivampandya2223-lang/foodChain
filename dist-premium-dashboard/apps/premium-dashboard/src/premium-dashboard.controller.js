"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PremiumDashboardController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const premium_dashboard_html_1 = require("./premium-dashboard.html");
let PremiumDashboardController = class PremiumDashboardController {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    getDashboard() {
        return (0, premium_dashboard_html_1.renderPremiumDashboardHtml)();
    }
    getConfig() {
        const adminDashboardUrl = this.configService.get('ADMIN_DASHBOARD_URL') ??
            'http://localhost:1309';
        return `window.FOOD_CHAIN_CONFIG = ${JSON.stringify({
            adminDashboardUrl,
        })};`;
    }
    getHealth() {
        return {
            service: 'food-chain-premium-dashboard',
            healthy: true,
        };
    }
};
exports.PremiumDashboardController = PremiumDashboardController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Header)('Content-Type', 'text/html'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PremiumDashboardController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('config.js'),
    (0, common_1.Header)('Content-Type', 'application/javascript'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PremiumDashboardController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PremiumDashboardController.prototype, "getHealth", null);
exports.PremiumDashboardController = PremiumDashboardController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PremiumDashboardController);
//# sourceMappingURL=premium-dashboard.controller.js.map