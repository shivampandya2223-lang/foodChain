"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.envValidationSchema = Joi.object({
    PORT: Joi.number().default(3000),
    INVENTORY_SERVICE_PORT: Joi.number().default(1306),
    NOTIFICATION_SERVICE_PORT: Joi.number().default(1307),
    ANALYTICS_SERVICE_PORT: Joi.number().default(1308),
    ADMIN_DASHBOARD_PORT: Joi.number().default(1309),
    PREMIUM_DASHBOARD_PORT: Joi.number().default(1310),
    ADMIN_DASHBOARD_URL: Joi.string().uri().default('http://localhost:1309'),
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().required(),
    DB_PRIMARY_HOST: Joi.string().allow('').default(''),
    DB_REPLICA_HOSTS: Joi.string().allow('').default(''),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    JWT_SECRET: Joi.string().min(16).required(),
    JWT_EXPIRES_IN: Joi.string().default('1d'),
    SEED_SUPER_ADMIN_EMAIL: Joi.string()
        .email()
        .default('superadmin@example.com'),
    SEED_SUPER_ADMIN_PASSWORD: Joi.string().min(8).default('Password@123'),
    KAFKA_ENABLED: Joi.boolean().default(false),
    KAFKA_CLIENT_ID: Joi.string().default('food-chain-api'),
    KAFKA_BROKERS: Joi.string().default('localhost:9092'),
    KAFKA_INVENTORY_GROUP_ID: Joi.string().default('food-chain-inventory'),
    KAFKA_NOTIFICATION_GROUP_ID: Joi.string().default('food-chain-notification'),
    KAFKA_ANALYTICS_GROUP_ID: Joi.string().default('food-chain-analytics'),
    KAFKA_ADMIN_DASHBOARD_GROUP_ID: Joi.string().default('food-chain-admin-dashboard'),
    KAFKA_SSL: Joi.boolean().default(false),
    KAFKA_SASL_MECHANISM: Joi.string()
        .valid('', 'plain', 'scram-sha-256', 'scram-sha-512')
        .default(''),
    KAFKA_SASL_USERNAME: Joi.string().allow('').default(''),
    KAFKA_SASL_PASSWORD: Joi.string().allow('').default(''),
    REDIS_ENABLED: Joi.boolean().default(false),
    REDIS_URL: Joi.string().uri().default('redis://localhost:6379'),
    MONGO_ENABLED: Joi.boolean().default(false),
    MONGO_URI: Joi.string().uri().default('mongodb://localhost:27017'),
    MONGO_DB_NAME: Joi.string().default('food_chain_events'),
    MONGO_EVENTS_COLLECTION: Joi.string().default('domain_events'),
    DASHBOARD_DEMO_PERSIST_ENABLED: Joi.boolean().default(false),
    OUTBOX_PUBLISHER_ENABLED: Joi.boolean().default(true),
    OUTBOX_POLL_INTERVAL_MS: Joi.number().default(100),
    OUTBOX_BATCH_SIZE: Joi.number().default(100),
    OUTBOX_MAX_ATTEMPTS: Joi.number().default(3),
});
//# sourceMappingURL=env.validation.js.map