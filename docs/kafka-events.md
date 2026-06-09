# Kafka Event Architecture

This project now runs Kafka in multiple separately deployable Nest apps:

- `food-chain-api`: REST API, auth, orders, users, shops, and Kafka producer.
- `apps/inventory-service`: consumes order and inventory stock events.
- `apps/notification-service`: consumes order/task events for notifications.
- `apps/analytics-service`: consumes all domain events for reporting.
- `apps/admin-dashboard`: dashboard API with real-time Kafka event stream over SSE.
- `apps/premium-dashboard`: premium Super Admin frontend that reads the dashboard API.

Data storage is split by responsibility:

- PostgreSQL: source of truth for auth, users, shops, products, inventory, menu, orders, tasks, devices, settings, and subscriptions.
- Redis: optional fast cache for dashboard counters, analytics snapshots, and recent event windows.
- MongoDB: optional high-volume event/audit store for Kafka/domain event payloads.

## Local Kafka

```bash
docker compose up -d kafka
```

Run all local infrastructure:

```bash
docker compose up -d redis mongo kafka
```

Enable Kafka in `.env`:

```env
KAFKA_ENABLED=true
KAFKA_CLIENT_ID=food-chain-api
KAFKA_BROKERS=localhost:9092
KAFKA_INVENTORY_GROUP_ID=food-chain-inventory
KAFKA_NOTIFICATION_GROUP_ID=food-chain-notification
KAFKA_ANALYTICS_GROUP_ID=food-chain-analytics
KAFKA_ADMIN_DASHBOARD_GROUP_ID=food-chain-admin-dashboard
ADMIN_DASHBOARD_URL=http://localhost:1309
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
MONGO_ENABLED=true
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=food_chain_events
MONGO_EVENTS_COLLECTION=domain_events
```

Run the API:

```bash
npm run start:dev
```

Run independent services in separate terminals:

```bash
npm run start:inventory
npm run start:notification
npm run start:analytics
npm run start:dashboard
npm run start:premium-dashboard
```

Each deployable server also has its own env and package file:

```text
apps/api-gateway/.env.example
apps/inventory-service/.env.example
apps/notification-service/.env.example
apps/analytics-service/.env.example
apps/admin-dashboard/.env.example
apps/premium-dashboard/.env.example

apps/api-gateway/package.json
apps/inventory-service/package.json
apps/notification-service/package.json
apps/analytics-service/package.json
apps/admin-dashboard/package.json
apps/premium-dashboard/package.json
```

The runtime env resolution order is:

```text
ENV_FILE
apps/<service>/.env.local
apps/<service>/.env
.env
```

Use `ENV_FILE` on real servers when your hosting platform mounts secrets somewhere else:

```bash
ENV_FILE=/etc/food-chain/inventory.env npm run start:inventory:prod
```

Production builds:

```bash
npm run build:inventory
npm run build:notification
npm run build:analytics
npm run build:dashboard
npm run build:premium-dashboard

npm run start:inventory:prod
npm run start:notification:prod
npm run start:analytics:prod
npm run start:dashboard:prod
npm run start:premium-dashboard:prod
```

Per-service package commands:

```bash
cd apps/inventory-service && npm run build && npm run start
cd apps/notification-service && npm run build && npm run start
cd apps/analytics-service && npm run build && npm run start
cd apps/admin-dashboard && npm run build && npm run start
cd apps/premium-dashboard && npm run build && npm run start
```

Default service URLs:

```text
Inventory:     http://localhost:1306
Notification:  http://localhost:1307
Analytics:     http://localhost:1308
Dashboard API: http://localhost:1309
Premium UI:    http://localhost:1310
```

Useful endpoints:

```text
GET /health
GET /api/summary        # dashboard API
GET /events/stream      # dashboard API SSE stream
GET /docs               # core API Swagger
```

## Remote Kafka

Point both servers at the same Kafka cluster:

```env
KAFKA_ENABLED=true
KAFKA_BROKERS=kafka-1.example.com:9092,kafka-2.example.com:9092
INVENTORY_SERVICE_PORT=1306
NOTIFICATION_SERVICE_PORT=1307
ANALYTICS_SERVICE_PORT=1308
ADMIN_DASHBOARD_PORT=1309
PREMIUM_DASHBOARD_PORT=1310
ADMIN_DASHBOARD_URL=https://dashboard-api.example.com
KAFKA_SSL=true
KAFKA_SASL_MECHANISM=plain
KAFKA_SASL_USERNAME=your-username
KAFKA_SASL_PASSWORD=your-password
```

Leave SASL values empty for unauthenticated clusters.

## Remote Redis and MongoDB

```env
REDIS_ENABLED=true
REDIS_URL=redis://redis.example.com:6379

MONGO_ENABLED=true
MONGO_URI=mongodb+srv://user:password@cluster.example.com
MONGO_DB_NAME=food_chain_events
MONGO_EVENTS_COLLECTION=domain_events
```

Keep `REDIS_ENABLED=false` and `MONGO_ENABLED=false` for local development when those services are not running.

## Topics

```text
order.created
order.updated
order.cancelled
inventory.stock_in
inventory.stock_out
task.created
task.completed
shop.created
user.created
```

## Future Extraction

The first real extraction should be inventory:

```text
food-chain-api
  publishes order.created

food-chain-inventory
  consumes order.created
  validates/deducts inventory
  publishes inventory.stock_out
```

For now, the API still performs inventory deduction synchronously so the monolith stays correct while Kafka demonstrates the production event boundary.
