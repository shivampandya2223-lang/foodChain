"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDomainEvent = createDomainEvent;
const crypto_1 = require("crypto");
function createDomainEvent(eventName, payload) {
    return {
        eventId: (0, crypto_1.randomUUID)(),
        eventName,
        occurredAt: new Date().toISOString(),
        payload,
    };
}
//# sourceMappingURL=kafka-event.factory.js.map