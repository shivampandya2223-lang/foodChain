# Food Chain

Food Chain is a NestJS backend for running a food-shop or restaurant chain. It manages authentication, role and permission based access, users, shops, products, inventory, menu recipes, orders, employee tasks, and shop devices. The main API stores operational data in PostgreSQL, can publish domain events to Kafka, and is paired with independent inventory, notification, analytics, admin dashboard, and premium dashboard apps. Inventory is updated synchronously for correctness, while Kafka/Redis/MongoDB support event-driven services, dashboards, analytics, and audit/event storage.

## Tech Stack

- NestJS 11 with TypeScript
- PostgreSQL with TypeORM
- JWT authentication with role and permission guards
- KafkaJS for domain events
- Transactional outbox for reliable Kafka publishing
- Redis and MongoDB as optional dashboard/event stores
- Swagger at `/docs`

## Project Apps

| App | Command | Default URL |
| --- | --- | --- |
| Main API / API gateway | `npm run start:dev` | `http://localhost:1304` from local `.env` (`3000` fallback) |
| Inventory service | `npm run start:inventory` | `http://localhost:1306` |
| Notification service | `npm run start:notification` | `http://localhost:1307` |
| Analytics service | `npm run start:analytics` | `http://localhost:1308` |
| Admin dashboard | `npm run start:dashboard` | `http://localhost:1309` |
| Premium dashboard | `npm run start:premium-dashboard` | `http://localhost:1310` |

## Project Structure

The repository is organized as a NestJS monorepo. The root `src/` folder contains the main API gateway and shared domain modules. The `apps/` folder contains separately runnable services and dashboards that can be deployed independently as the architecture grows.

```text
food-chain/
├── apps/
│   ├── api-gateway/              # Environment/package wrapper for the main API
│   ├── inventory-service/        # Kafka consumer for inventory/order events
│   ├── notification-service/     # Kafka consumer for notification workflows
│   ├── analytics-service/        # Kafka consumer for analytics/read models
│   ├── admin-dashboard/          # Internal dashboard API + SSE stream
│   └── premium-dashboard/        # Premium dashboard UI shell
├── src/
│   ├── auth/                     # Login, JWT strategy, guards, decorators
│   ├── common/                   # Shared enums, guards, filters, interceptors
│   ├── config/                   # Env loading and validation
│   ├── contracts/                # Shared event contracts
│   ├── database/                 # TypeORM setup and seed service
│   ├── events/                   # Transactional outbox and event publishing
│   ├── inventory/                # Inventory items, stock moves, transactions
│   ├── kafka/                    # Kafka client and producer
│   ├── menu/                     # Menu items and recipe ingredients
│   ├── orders/                   # Orders, status flow, stock deduction/restore
│   ├── products/                 # Products and linked inventory records
│   ├── shops/                    # Shop lifecycle and user assignment
│   ├── storage/                  # Redis, MongoDB, Postgres event stores
│   ├── tasks/                    # Employee task management
│   ├── users/                    # User creation, profile, scoped reads
│   └── main.ts                   # Main API bootstrap
├── docs/
├── test/
├── docker-compose.yml
├── package.json
└── tsconfig*.json
```

Most API modules follow this pattern:

```text
<module>/
├── dto/                          # Request payload validation classes
├── entities/                     # TypeORM entities
├── <module>.controller.ts        # HTTP endpoints and guards
├── <module>.service.ts           # Business logic and transactions
└── <module>.module.ts            # Nest module wiring
```

## Implemented Scaling Improvements

This project now includes the first production-scaling changes from the architecture plan:

- Redis JWT cache: `JwtStrategy` checks `auth:user:<userId>` before loading the user/roles/permissions from PostgreSQL. Cached auth payloads expire after 5 minutes.
- TypeORM read replicas: set `DB_REPLICA_HOSTS` to enable TypeORM replication. Reads can go to replicas while writes and transactions stay on the primary.
- Transactional outbox: domain services enqueue events in `outbox_events`; `OutboxPublisherService` publishes pending events to Kafka asynchronously.
- Kafka partition keys: outbox events use `shopId` where available so a shop's events stay ordered while different shops process in parallel.

```text
Client
  │
  ▼
API Pod (NestJS)
  │
  ├─ 1. Validate JWT from Redis cache
  ├─ 2. Begin PostgreSQL transaction on primary
  │     ├─ Lock inventory rows
  │     ├─ Deduct or restore inventory
  │     ├─ Save order/inventory records
  │     └─ Write outbox event with status=PENDING
  ├─ 3. Commit transaction
  └─ 4. Return response without waiting for Kafka

Async worker:
  OutboxPublisherService polls pending events
    └─ Publishes to Kafka
       ├─ Inventory service consumes events
       ├─ Notification service consumes events
       └─ Analytics service updates reporting/read models
```

## Production Architecture Target

```text
                         ┌─────────────────────────────────┐
                         │         Load Balancer            │
                         │      (Nginx / AWS ALB)           │
                         └────────────┬────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
        ┌─────▼─────┐          ┌──────▼─────┐         ┌──────▼─────┐
        │ API Pod 1 │          │ API Pod 2  │         │ API Pod N  │
        │ NestJS    │          │ NestJS     │         │ NestJS     │
        └─────┬─────┘          └─────┬──────┘         └─────┬──────┘
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     │
        ┌────────────────────────────┼─────────────────────────────┐
        │                            │                             │
   ┌────▼─────┐               ┌──────▼──────┐              ┌───────▼──────┐
   │ Redis    │               │ PostgreSQL  │              │ Kafka        │
   │ Cluster  │               │ Primary     │              │ Cluster      │
   │ Cache +  │               │ + Replicas  │              │ 3+ Brokers   │
   │ Sessions │               │ PgBouncer   │              │              │
   └──────────┘               └─────────────┘              └──────┬───────┘
                                                                  │
                              ┌───────────────────────────────────┤
                              │                   │               │
                     ┌────────▼──────┐   ┌────────▼──────┐ ┌──────▼──────┐
                     │ Inventory     │   │ Notification  │ │ Analytics   │
                     │ Service       │   │ Service       │ │ Service     │
                     │ Own DB/Model  │   │ Own DB/Model  │ │ MongoDB     │
                     └───────────────┘   └───────────────┘ └─────────────┘
```

## Setup

```bash
npm install
```

Start optional local infrastructure:

```bash
docker compose up -d redis mongo kafka
```

PostgreSQL is required separately. The local `.env` expects:

```env
DB_HOST=localhost
DB_PORT=5432
DB_PRIMARY_HOST=
DB_REPLICA_HOSTS=
DB_USERNAME=postgres
DB_PASSWORD=PASSWORD
DB_NAME=food_chain
JWT_SECRET=food-chain-local-development-secret
```

For production read replicas, set `DB_PRIMARY_HOST` and comma-separated `DB_REPLICA_HOSTS`. If `DB_REPLICA_HOSTS` is empty, the app uses the single `DB_HOST` connection.

Run database seed data:

```bash
npm run seed
```

Seed login:

```json
{
  "email": "superadmin@example.com",
  "password": "Password@123"
}
```

Run the API:

```bash
npm run start:dev
```

Open Swagger:

```text
http://localhost:1304/docs
```

## Authentication

Except `GET /` and `POST /auth/login`, the main API routes require:

```http
Authorization: Bearer <accessToken>
```

Routes are also protected by roles and/or permissions. Important enum values:

```text
Roles: SUPER_ADMIN, ADMIN, OWNER, EMPLOYEE
Order statuses: PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED
Task statuses: TODO, IN_PROGRESS, DONE, CANCELLED
Device types: ORDER_DEVICE, STOCK_DEVICE
```

## Common Response Shape

The API returns TypeORM entities directly. Most persisted objects include:

```json
{
  "id": "8d4434ac-4b58-4c26-aea8-fdf76f14524c",
  "createdAt": "2026-06-11T10:00:00.000Z",
  "updatedAt": "2026-06-11T10:00:00.000Z"
}
```

Validation errors use Nest's standard error response:

```json
{
  "message": ["price must be a number string"],
  "error": "Bad Request",
  "statusCode": 400
}
```

## Main API Endpoints

Base URL for local `.env`: `http://localhost:1304`

### Root

#### `GET /`

Payload: none

Response:

```text
Hello World!
```

### Authentication

#### `POST /auth/login`

Payload:

```json
{
  "email": "superadmin@example.com",
  "password": "Password@123"
}
```

Response:

```json
{
  "accessToken": "jwt.token.value",
  "user": {
    "id": "user-uuid",
    "email": "superadmin@example.com",
    "firstName": "Super",
    "lastName": "Admin",
    "roles": ["SUPER_ADMIN"],
    "permissions": ["user.create", "shop.create", "order.read"]
  }
}
```

#### `GET /auth/me`

Payload: none

Response:

```json
{
  "id": "user-uuid",
  "email": "superadmin@example.com",
  "roles": ["SUPER_ADMIN"],
  "permissions": ["user.create", "shop.create"],
  "shopIds": ["shop-uuid"]
}
```

### Users

#### `POST /users`

Payload:

```json
{
  "email": "owner@example.com",
  "password": "Password@123",
  "firstName": "Shivam",
  "lastName": "Pandya",
  "phone": "+919999999999",
  "roles": ["OWNER"],
  "shopIds": ["shop-uuid"]
}
```

Response:

```json
{
  "id": "user-uuid",
  "email": "owner@example.com",
  "firstName": "Shivam",
  "lastName": "Pandya",
  "phone": "+919999999999",
  "isActive": true,
  "roles": [{ "id": "role-uuid", "name": "OWNER" }],
  "shops": [{ "id": "shop-uuid", "name": "Demo Shop" }]
}
```

#### `GET /users`

Payload: none

Response:

```json
[
  {
    "id": "user-uuid",
    "email": "owner@example.com",
    "firstName": "Shivam",
    "lastName": "Pandya",
    "roles": [{ "name": "OWNER" }],
    "shops": [{ "id": "shop-uuid", "name": "Demo Shop" }]
  }
]
```

#### `GET /users/me`

Payload: none

Response:

```json
{
  "id": "user-uuid",
  "email": "superadmin@example.com",
  "firstName": "Super",
  "lastName": "Admin",
  "roles": [{ "name": "SUPER_ADMIN", "permissions": [{ "name": "user.read" }] }],
  "shops": [{ "id": "shop-uuid", "name": "Demo Shop" }]
}
```

#### `GET /users/:id`

Payload: none

Response:

```json
{
  "id": "user-uuid",
  "email": "owner@example.com",
  "firstName": "Shivam",
  "lastName": "Pandya",
  "roles": [{ "name": "OWNER" }],
  "shops": [{ "id": "shop-uuid", "name": "Demo Shop" }]
}
```

### Shops

#### `POST /shops`

Payload:

```json
{
  "name": "Downtown Food Shop",
  "slug": "downtown-food-shop",
  "address": "123 Market Road, Ahmedabad",
  "phone": "+919999999999",
  "ownerId": "user-uuid"
}
```

Response:

```json
{
  "id": "shop-uuid",
  "name": "Downtown Food Shop",
  "slug": "downtown-food-shop",
  "address": "123 Market Road, Ahmedabad",
  "phone": "+919999999999",
  "isActive": true,
  "owner": { "id": "user-uuid", "email": "owner@example.com" },
  "users": [{ "id": "user-uuid", "email": "owner@example.com" }]
}
```

#### `GET /shops`

Payload: none

Response:

```json
[
  {
    "id": "shop-uuid",
    "name": "Demo Shop",
    "slug": "demo-shop",
    "isActive": true,
    "owner": { "id": "user-uuid", "email": "superadmin@example.com" },
    "users": [{ "id": "user-uuid", "email": "superadmin@example.com" }],
    "subscription": null
  }
]
```

#### `GET /shops/:id`

Payload: none

Response:

```json
{
  "id": "shop-uuid",
  "name": "Demo Shop",
  "slug": "demo-shop",
  "owner": { "id": "user-uuid", "email": "superadmin@example.com" },
  "users": [{ "id": "user-uuid", "roles": [{ "name": "SUPER_ADMIN" }] }],
  "products": [{ "id": "product-uuid", "name": "Cheese" }],
  "inventoryItems": [{ "id": "inventory-item-uuid", "quantity": "50.000" }],
  "subscription": null
}
```

#### `PATCH /shops/:id`

Payload:

```json
{
  "name": "Downtown Food Shop",
  "slug": "downtown-food-shop",
  "address": "123 Market Road, Ahmedabad",
  "phone": "+919999999999",
  "isActive": true,
  "ownerId": "user-uuid"
}
```

Response:

```json
{
  "id": "shop-uuid",
  "name": "Downtown Food Shop",
  "slug": "downtown-food-shop",
  "isActive": true,
  "owner": { "id": "user-uuid" },
  "users": [{ "id": "user-uuid" }]
}
```

#### `PATCH /shops/:id/users`

Payload:

```json
{
  "userIds": ["user-uuid"]
}
```

Response:

```json
{
  "id": "shop-uuid",
  "name": "Demo Shop",
  "users": [{ "id": "user-uuid", "email": "owner@example.com" }]
}
```

#### `DELETE /shops/:id`

Payload: none

Response:

```json
{
  "id": "shop-uuid",
  "name": "Demo Shop",
  "isActive": false
}
```

### Products

#### `POST /products`

Payload:

```json
{
  "name": "Cheese",
  "sku": "CHEESE-001",
  "description": "Mozzarella cheese for pizza recipes",
  "price": "120.00",
  "shopId": "shop-uuid"
}
```

Response:

```json
{
  "id": "product-uuid",
  "name": "Cheese",
  "sku": "CHEESE-001",
  "description": "Mozzarella cheese for pizza recipes",
  "price": "120.00",
  "isActive": true,
  "shop": { "id": "shop-uuid", "name": "Demo Shop" },
  "inventoryItem": {
    "id": "inventory-item-uuid",
    "quantity": "0.000",
    "reorderLevel": "0.000"
  }
}
```

#### `GET /products`

Payload: none

Response:

```json
[
  {
    "id": "product-uuid",
    "name": "Cheese",
    "sku": "CHEESE-001",
    "price": "120.00",
    "isActive": true,
    "shop": { "id": "shop-uuid", "name": "Demo Shop" },
    "inventoryItem": { "id": "inventory-item-uuid", "quantity": "50.000" }
  }
]
```

#### `GET /products/:id`

Payload: none

Response:

```json
{
  "id": "product-uuid",
  "name": "Cheese",
  "sku": "CHEESE-001",
  "price": "120.00",
  "shop": { "id": "shop-uuid", "name": "Demo Shop" },
  "inventoryItem": { "id": "inventory-item-uuid", "quantity": "50.000" }
}
```

#### `PATCH /products/:id`

Payload:

```json
{
  "name": "Cheese",
  "sku": "CHEESE-001",
  "description": "Updated description",
  "price": "125.00",
  "isActive": true
}
```

Response:

```json
{
  "id": "product-uuid",
  "name": "Cheese",
  "sku": "CHEESE-001",
  "description": "Updated description",
  "price": "125.00",
  "isActive": true
}
```

#### `DELETE /products/:id`

Payload: none

Response:

```json
{
  "id": "product-uuid",
  "name": "Cheese",
  "isActive": false
}
```

### Inventory

#### `POST /inventory/stock-in`

Payload:

```json
{
  "inventoryItemId": "inventory-item-uuid",
  "quantity": "25.000",
  "reason": "Supplier delivery"
}
```

Response:

```json
{
  "inventoryItem": {
    "id": "inventory-item-uuid",
    "quantity": "75.000",
    "product": { "id": "product-uuid", "name": "Cheese" },
    "shop": { "id": "shop-uuid", "name": "Demo Shop" }
  },
  "transaction": {
    "id": "transaction-uuid",
    "type": "STOCK_IN",
    "source": "PURCHASE",
    "quantity": "25.000",
    "quantityBefore": "50.000",
    "quantityAfter": "75.000",
    "reason": "Supplier delivery"
  }
}
```

#### `POST /inventory/stock-out`

Payload:

```json
{
  "inventoryItemId": "inventory-item-uuid",
  "quantity": "5.000",
  "reason": "Manual adjustment"
}
```

Response:

```json
{
  "inventoryItem": {
    "id": "inventory-item-uuid",
    "quantity": "70.000",
    "product": { "id": "product-uuid", "name": "Cheese" },
    "shop": { "id": "shop-uuid", "name": "Demo Shop" }
  },
  "transaction": {
    "id": "transaction-uuid",
    "type": "STOCK_OUT",
    "source": "MANUAL",
    "quantity": "5.000",
    "quantityBefore": "75.000",
    "quantityAfter": "70.000",
    "reason": "Manual adjustment"
  }
}
```

#### `GET /inventory`

Payload: none

Response:

```json
[
  {
    "id": "inventory-item-uuid",
    "quantity": "70.000",
    "reorderLevel": "0.000",
    "product": { "id": "product-uuid", "name": "Cheese", "sku": "CHEESE-001" },
    "shop": { "id": "shop-uuid", "name": "Demo Shop" }
  }
]
```

#### `GET /inventory/transactions`

Payload: none

Response:

```json
[
  {
    "id": "transaction-uuid",
    "type": "STOCK_IN",
    "source": "PURCHASE",
    "quantity": "25.000",
    "quantityBefore": "50.000",
    "quantityAfter": "75.000",
    "inventoryItem": {
      "id": "inventory-item-uuid",
      "product": { "id": "product-uuid", "name": "Cheese" }
    },
    "shop": { "id": "shop-uuid", "name": "Demo Shop" },
    "createdBy": { "id": "user-uuid", "email": "superadmin@example.com" }
  }
]
```

### Menu

#### `POST /menu`

Payload:

```json
{
  "name": "Margherita Pizza",
  "description": "Classic cheese pizza",
  "price": "249.00",
  "shopId": "shop-uuid",
  "recipeItems": [
    {
      "productId": "product-uuid",
      "quantity": "1.000",
      "unit": "unit"
    }
  ]
}
```

Response:

```json
{
  "id": "menu-item-uuid",
  "name": "Margherita Pizza",
  "description": "Classic cheese pizza",
  "price": "249.00",
  "isAvailable": true,
  "shop": { "id": "shop-uuid", "name": "Demo Shop" },
  "recipeItems": [
    {
      "id": "recipe-item-uuid",
      "quantity": "1.000",
      "unit": "unit",
      "product": { "id": "product-uuid", "name": "Cheese" }
    }
  ]
}
```

#### `GET /menu`

Payload: none

Response:

```json
[
  {
    "id": "menu-item-uuid",
    "name": "Margherita Pizza",
    "price": "249.00",
    "isAvailable": true,
    "shop": { "id": "shop-uuid", "name": "Demo Shop" },
    "recipeItems": [
      { "quantity": "1.000", "unit": "unit", "product": { "name": "Cheese" } }
    ]
  }
]
```

#### `PATCH /menu/:id`

Payload:

```json
{
  "name": "Margherita Pizza",
  "description": "Classic cheese pizza",
  "price": "259.00",
  "isAvailable": true,
  "recipeItems": [
    {
      "productId": "product-uuid",
      "quantity": "1.250",
      "unit": "unit"
    }
  ]
}
```

Response:

```json
{
  "id": "menu-item-uuid",
  "name": "Margherita Pizza",
  "price": "259.00",
  "isAvailable": true,
  "recipeItems": [{ "quantity": "1.250", "unit": "unit" }]
}
```

#### `DELETE /menu/:id`

Payload: none

Response:

```json
{
  "id": "menu-item-uuid",
  "name": "Margherita Pizza",
  "isAvailable": false
}
```

### Orders

#### `POST /orders`

Payload:

```json
{
  "shopId": "shop-uuid",
  "customerName": "Walk-in Customer",
  "customerPhone": "+919999999999",
  "items": [
    {
      "menuItemId": "menu-item-uuid",
      "quantity": 1
    }
  ]
}
```

Response:

```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-1781162400000-001",
  "status": "PENDING",
  "customerName": "Walk-in Customer",
  "customerPhone": "+919999999999",
  "totalAmount": "249.00",
  "shop": { "id": "shop-uuid", "name": "Demo Shop" },
  "employee": { "id": "user-uuid", "email": "superadmin@example.com" },
  "items": [
    {
      "id": "order-item-uuid",
      "quantity": 1,
      "unitPrice": "249.00",
      "lineTotal": "249.00",
      "menuItem": { "id": "menu-item-uuid", "name": "Margherita Pizza" }
    }
  ]
}
```

#### `GET /orders`

Payload: none

Response:

```json
[
  {
    "id": "order-uuid",
    "orderNumber": "ORD-1781162400000-001",
    "status": "PENDING",
    "totalAmount": "249.00",
    "shop": { "id": "shop-uuid", "name": "Demo Shop" },
    "employee": { "id": "user-uuid", "email": "superadmin@example.com" },
    "items": [{ "quantity": 1, "menuItem": { "name": "Margherita Pizza" } }]
  }
]
```

#### `GET /orders/:id`

Payload: none

Response:

```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-1781162400000-001",
  "status": "PENDING",
  "totalAmount": "249.00",
  "shop": { "id": "shop-uuid", "name": "Demo Shop" },
  "items": [{ "quantity": 1, "menuItem": { "name": "Margherita Pizza" } }]
}
```

#### `PATCH /orders/:id/status`

Payload:

```json
{
  "status": "CONFIRMED"
}
```

Response:

```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-1781162400000-001",
  "status": "CONFIRMED",
  "totalAmount": "249.00"
}
```

Allowed transitions:

```text
PENDING -> CONFIRMED
CONFIRMED -> PREPARING
PREPARING -> READY
READY -> COMPLETED
```

Use `PATCH /orders/:id/cancel` for cancellation so inventory is restored and the cancellation event is published.

#### `PATCH /orders/:id/cancel`

Payload: none

Response:

```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-1781162400000-001",
  "status": "CANCELLED"
}
```

Only pending orders can be cancelled.

### Tasks

#### `POST /tasks`

Payload:

```json
{
  "title": "Refill Cheese Stock",
  "description": "Move cheese from storage to prep station",
  "shopId": "shop-uuid",
  "assignedToId": "user-uuid",
  "dueAt": "2026-06-08T18:00:00.000Z"
}
```

Response:

```json
{
  "id": "task-uuid",
  "title": "Refill Cheese Stock",
  "description": "Move cheese from storage to prep station",
  "status": "TODO",
  "dueAt": "2026-06-08T18:00:00.000Z",
  "shop": { "id": "shop-uuid", "name": "Demo Shop" },
  "assignedTo": { "id": "user-uuid", "email": "employee@example.com" }
}
```

#### `GET /tasks`

Payload: none

Response:

```json
[
  {
    "id": "task-uuid",
    "title": "Refill Cheese Stock",
    "status": "TODO",
    "shop": { "id": "shop-uuid", "name": "Demo Shop" },
    "assignedTo": { "id": "user-uuid", "email": "employee@example.com" }
  }
]
```

#### `PATCH /tasks/:id`

Payload:

```json
{
  "title": "Clean Kitchen",
  "description": "Deep clean prep counter",
  "status": "IN_PROGRESS",
  "assignedToId": "user-uuid",
  "dueAt": "2026-06-08T18:00:00.000Z"
}
```

Response:

```json
{
  "id": "task-uuid",
  "title": "Clean Kitchen",
  "description": "Deep clean prep counter",
  "status": "IN_PROGRESS",
  "assignedTo": { "id": "user-uuid" },
  "dueAt": "2026-06-08T18:00:00.000Z"
}
```

### Devices

#### `POST /devices`

Payload:

```json
{
  "name": "Kitchen Order Tablet",
  "type": "ORDER_DEVICE",
  "shopId": "shop-uuid",
  "deviceKey": "device-order-001"
}
```

Response:

```json
{
  "id": "device-uuid",
  "name": "Kitchen Order Tablet",
  "type": "ORDER_DEVICE",
  "deviceKey": "device-order-001",
  "isActive": true,
  "shop": { "id": "shop-uuid", "name": "Demo Shop" }
}
```

#### `GET /devices`

Payload: none

Response:

```json
[
  {
    "id": "device-uuid",
    "name": "Kitchen Order Tablet",
    "type": "ORDER_DEVICE",
    "deviceKey": "device-order-001",
    "isActive": true,
    "shop": { "id": "shop-uuid", "name": "Demo Shop" }
  }
]
```

#### `PATCH /devices/:id`

Payload:

```json
{
  "name": "Stock Counter Tablet",
  "type": "STOCK_DEVICE",
  "deviceKey": "device-stock-001",
  "isActive": true
}
```

Response:

```json
{
  "id": "device-uuid",
  "name": "Stock Counter Tablet",
  "type": "STOCK_DEVICE",
  "deviceKey": "device-stock-001",
  "isActive": true,
  "shop": { "id": "shop-uuid", "name": "Demo Shop" }
}
```

## Service and Dashboard Endpoints

### Inventory Service (`http://localhost:1306`)

#### `GET /`

Payload: none

Response:

```json
{
  "service": "food-chain-inventory-service",
  "status": "running"
}
```

#### `GET /health`

Payload: none

Response:

```json
{
  "service": "food-chain-inventory-service",
  "healthy": true,
  "kafka": {
    "enabled": false,
    "connected": false,
    "brokers": ["localhost:9092"],
    "groupId": "food-chain-inventory",
    "topics": ["order.created", "order.cancelled", "inventory.stock_in", "inventory.stock_out"],
    "consumedByTopic": {}
  }
}
```

#### `GET /events/status`

Payload: none

Response:

```json
{
  "service": "food-chain-inventory-service",
  "enabled": false,
  "connected": false,
  "brokers": ["localhost:9092"],
  "groupId": "food-chain-inventory",
  "topics": ["order.created", "order.cancelled", "inventory.stock_in", "inventory.stock_out"],
  "consumedByTopic": {}
}
```

### Notification Service (`http://localhost:1307`)

#### `GET /`

Payload: none

Response:

```json
{
  "service": "food-chain-notification-service",
  "status": "running"
}
```

#### `GET /health`

Payload: none

Response:

```json
{
  "service": "food-chain-notification-service",
  "healthy": true,
  "kafka": {
    "enabled": false,
    "connected": false,
    "brokers": ["localhost:9092"],
    "groupId": "food-chain-notification",
    "topics": ["order.created", "order.updated", "task.created"],
    "consumedByTopic": {}
  }
}
```

#### `GET /events/status`

Payload: none

Response:

```json
{
  "service": "food-chain-notification-service",
  "enabled": false,
  "connected": false,
  "brokers": ["localhost:9092"],
  "groupId": "food-chain-notification",
  "topics": ["order.created", "order.updated", "task.created"],
  "consumedByTopic": {}
}
```

### Analytics Service (`http://localhost:1308`)

#### `GET /`

Payload: none

Response:

```json
{
  "service": "food-chain-analytics-service",
  "status": "running"
}
```

#### `GET /health`

Payload: none

Response:

```json
{
  "service": "food-chain-analytics-service",
  "healthy": true,
  "kafka": {
    "enabled": false,
    "connected": false,
    "brokers": ["localhost:9092"],
    "groupId": "food-chain-analytics",
    "topics": ["order.created", "order.updated", "order.cancelled", "inventory.stock_in", "inventory.stock_out", "task.created", "task.completed", "shop.created", "user.created"],
    "consumedByTopic": {}
  }
}
```

#### `GET /events/status`

Payload: none

Response:

```json
{
  "service": "food-chain-analytics-service",
  "enabled": false,
  "connected": false,
  "brokers": ["localhost:9092"],
  "groupId": "food-chain-analytics",
  "topics": ["order.created", "order.updated", "order.cancelled", "inventory.stock_in", "inventory.stock_out", "task.created", "task.completed", "shop.created", "user.created"],
  "consumedByTopic": {}
}
```

### Admin Dashboard (`http://localhost:1309`)

#### `GET /`

Payload: none

Response: HTML dashboard page.

#### `GET /health`

Payload: none

Response:

```json
{
  "service": "food-chain-admin-dashboard",
  "healthy": true,
  "kafka": {
    "enabled": false,
    "connected": false
  }
}
```

#### `GET /api/summary`

Payload: none

Response:

```json
{
  "kafka": {
    "enabled": false,
    "connected": false
  },
  "services": [
    { "name": "API Gateway", "url": "http://localhost:1304", "healthy": true },
    { "name": "Inventory Service", "url": "http://localhost:1306", "healthy": true }
  ],
  "modules": ["Auth", "Users", "Shops", "Products", "Inventory", "Menu", "Orders", "Tasks", "Devices"],
  "roleHierarchy": ["SUPER_ADMIN", "ADMIN", "OWNER", "EMPLOYEE"],
  "recentEvents": [],
  "transactions": [],
  "business": {
    "shops": 1,
    "ordersToday": 0,
    "revenueToday": 0
  },
  "analytics": {
    "eventsByTopic": {}
  },
  "storage": {
    "redis": { "enabled": false },
    "mongo": { "enabled": false },
    "postgres": { "enabled": true, "host": "localhost", "database": "food_chain" }
  },
  "persistence": {
    "mode": "demo-loader",
    "demoPersistenceEnabled": false,
    "databaseWritesActive": false
  }
}
```

Actual counter values depend on persisted demo data and Kafka/Redis/Mongo settings.

#### `GET /events/stream`

Payload: none

Response: Server-Sent Events stream.

```text
event: domain-event
data: {"topic":"order.created","payload":{"orderId":"order-uuid"}}
```

### Premium Dashboard (`http://localhost:1310`)

#### `GET /`

Payload: none

Response: HTML premium dashboard page.

#### `GET /config.js`

Payload: none

Response:

```javascript
window.FOOD_CHAIN_CONFIG = {"adminDashboardUrl":"http://localhost:1309"};
```

#### `GET /health`

Payload: none

Response:

```json
{
  "service": "food-chain-premium-dashboard",
  "healthy": true
}
```

## Kafka Events

Topics:

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

Enable Kafka and optional stores in `.env`:

```env
KAFKA_ENABLED=true
KAFKA_BROKERS=localhost:9092
OUTBOX_PUBLISHER_ENABLED=true
OUTBOX_POLL_INTERVAL_MS=100
OUTBOX_BATCH_SIZE=100
OUTBOX_MAX_ATTEMPTS=3
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
MONGO_ENABLED=true
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=food_chain_events
MONGO_EVENTS_COLLECTION=domain_events
```

API services do not publish domain events directly from request handlers. They enqueue events into `outbox_events`; the outbox publisher sends them to Kafka asynchronously. If Kafka is disabled or unavailable, pending events stay in PostgreSQL until the publisher can send them.

JWT validation uses Redis when `REDIS_ENABLED=true`. The key format is `auth:user:<userId>` and cached auth payloads expire after 5 minutes.

More detail is available in [docs/kafka-events.md](docs/kafka-events.md).

## Build and Test

```bash
npm run build
npm run build:all
npm run test
npm run test:e2e
npm run test:cov
```
