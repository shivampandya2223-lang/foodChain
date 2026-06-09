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
var RedisCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_1 = require("redis");
let RedisCacheService = RedisCacheService_1 = class RedisCacheService {
    configService;
    logger = new common_1.Logger(RedisCacheService_1.name);
    client;
    connected = false;
    lastError;
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        if (!this.isEnabled()) {
            this.logger.log('Redis cache disabled');
            return;
        }
        this.client = (0, redis_1.createClient)({
            url: this.configService.get('REDIS_URL'),
        });
        this.client.on('error', (error) => {
            this.connected = false;
            this.lastError = error instanceof Error ? error.message : String(error);
            this.logger.error(`Redis error: ${this.lastError}`);
        });
        try {
            await this.client.connect();
            this.connected = true;
            this.logger.log('Redis cache connected');
        }
        catch (error) {
            this.connected = false;
            this.lastError = error instanceof Error ? error.message : String(error);
            this.logger.error(`Redis connection failed: ${this.lastError}`);
        }
    }
    async onApplicationShutdown() {
        if (this.client?.isOpen) {
            await this.client.quit();
            this.connected = false;
        }
    }
    getStatus() {
        return {
            enabled: this.isEnabled(),
            connected: this.connected,
            url: this.configService.get('REDIS_URL'),
            lastError: this.lastError,
        };
    }
    async setJson(key, value, ttlSeconds) {
        if (!this.client?.isOpen) {
            return;
        }
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.setEx(key, ttlSeconds, serialized);
            return;
        }
        await this.client.set(key, serialized);
    }
    async incrementHashBy(key, field, amount) {
        if (!this.client?.isOpen) {
            return;
        }
        await this.client.hIncrBy(key, field, amount);
    }
    isEnabled() {
        return this.configService.get('REDIS_ENABLED') ?? false;
    }
};
exports.RedisCacheService = RedisCacheService;
exports.RedisCacheService = RedisCacheService = RedisCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisCacheService);
//# sourceMappingURL=redis-cache.service.js.map