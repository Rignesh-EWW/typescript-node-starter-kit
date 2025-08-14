# 🚀 Node.js + TypeScript Starter Kit

This project is an open source template for building robust APIs with Node.js. It combines a clean architecture approach with TypeScript, Express and Prisma so teams can quickly bootstrap production ready services.

Designed to be modular and scalable, the kit includes Redis backed sessions, a testing setup with Jest and Supertest, and a complete admin/user separation out of the box.

---

## Directory Overview

```text
src/                     # Application source
├── api/                 # Swagger docs and route entry points
├── config/              # Environment helpers and global config
├── constants/           # App-wide enums and messages
├── decorators/          # Route decorators such as logging
├── domain/              # DDD entities, interfaces and value objects
├── events/              # Event emitters and listeners
├── jobs/                # BullMQ queues and processors
├── middlewares/         # Auth, rate limiting and validation
├── repositories/        # Database access via Prisma
├── requests/            # Zod request validators
├── resources/           # Response wrappers
├── routes/              # Route controllers (admin & user)
├── services/            # Business logic layer
├── telemetry/           # Sentry integration
├── templates/           # Email templates
├── types/               # Custom TypeScript types
├── utils/               # Helper utilities
├── index.ts             # App entry point
└── server.ts            # Express bootstrap

prisma/                  # Prisma schema, migrations and seeds
scripts/                 # Helper scripts (workers, CLI utilities)
tests/                   # Jest + Supertest suites
```

---

## 🛠 Installation

Install the dependencies:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run prisma:studio (optional)
npm run dev
```

---

## 🔐 Auth System

- User registration, login and OTP flow
- Admin login with session management
- Redis backed session and OTP cache
- Uses `express-session` and `connect-redis`

---

## 🛡️ Role & Permission Middleware

Built-in middleware makes it easy to guard routes using roles and permissions.

```ts
import {
  requireRole,
  requireAllRoles,
  requirePermission,
  requireAllPermissions,
  roleOrPermission,
} from "@/middlewares/rbacMiddleware";

// User must have any of the roles
app.get("/admin", requireRole("admin|moderator"), handler);

// User must have all listed roles
app.post(
  "/manage",
  requireAllRoles(["editor", "approver"]),
  handler,
);

// User must have any of the permissions
app.delete(
  "/posts",
  requirePermission("delete posts|force delete posts"),
  handler,
);

// User must have all listed permissions
app.put(
  "/posts",
  requireAllPermissions(["edit posts", "publish posts"]),
  handler,
);

// User must have either the role or the permission
app.get("/reports", roleOrPermission("admin|view reports"), handler);
```

These helpers mirror the expressive style of Laravel's Spatie package while
keeping the API lightweight.

### Using middleware with Express routers

You can also protect entire route groups by applying the middleware to an
`express.Router`, similar to Laravel's route middleware:

```ts
import { Router } from "express";
import { requireRole, requirePermission } from "@/middlewares/rbacMiddleware";

const admin = Router();

// Restrict all routes in this group to admin users
admin.use(requireRole("admin"));

// Further protect individual routes with permissions
admin.post(
  "/users",
  requirePermission("create users|edit users"),
  createUserHandler,
);

export default admin;
```

---

## ✅ Modules Implemented

### 👤 Users

- Register/Login
- OTP + Forgot Password
- Profile update & change password
- Notifications (list, mark read, clear)
- Logout (destroy session)

### 🧑‍💼 Admin

- Login
- User management
- App Settings CRUD
- App Menu Links
- App Variables
- User Export (CSV/XLSX)

---

## 🧪 Testing

- Jest + Supertest configured in `tests/`
- `ts-jest` with `.env.test`
- Seed script available at `prisma/seed.ts`

Run all tests:

```bash
npm run test
```

---

## 🔁 Run in Dev Mode

```bash
npm run dev
```

`nodemon.json` watches the `src` folder and runs `ts-node` on changes.

---

## 🌱 Seed Sample Data

```bash
npm run seed
# or
ts-node prisma/seed.ts
```

---

## ⚙️ Prisma Commands

```bash
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

---

## 🌐 Environment Setup

Create `.env` and `.env.test` from `.env.example` and adjust the values:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/smartinbox
REDIS_URL=redis://localhost:6379
SESSION_SECRET=mysecret
```

`src/config/env.ts` exposes helpers like `isProduction` so code can check the runtime environment easily.

---

## 🔄 GitHub Actions CI

The `ci.yml` workflow runs tests on every push or PR:

- Spins up PostgreSQL & Redis
- Runs Prisma migrations
- Executes Jest + Supertest

---

## 📤 Export API

```http
GET /admin/export/users/csv
GET /admin/export/users/xlsx
```

---

## 📚 Media Library Examples

Use the built–in media endpoints to attach files to any model.

```http
# Upload a single avatar for user 1
POST /api/media/upload (file field: "file")
Body: { "model_type": "users", "model_id": 1, "collection": "avatar" }

# Upload multiple gallery images for post 5
POST /api/media/upload-multiple (file field: "files")
Body: { "model_type": "posts", "model_id": 5, "collection": "gallery" }

# List media for a model/collection
GET /api/media/by-model?model_type=users&model_id=1&collection=avatar

# Delete a media item
DELETE /api/media/:id
```

Each response contains the persisted media id and a publicly accessible URL. Files are stored using the path pattern `<model_type>/<model_id>/<collection>/<uuid>.<ext>`.

### Collections & Conversions

Configure collections and image conversions in `src/config/media-collections.ts`:

```ts
export const mediaCollections = {
  avatar: {
    singleFile: true,
    conversions: [{ name: 'thumb', width: 200, height: 200 }],
    acceptsMimeTypes: ['image/png', 'image/jpeg'],
    fallbackUrl: '/images/default-avatar.png',
  },
  gallery: { maxFiles: 10 },
};
```

Uploaded images for the `avatar` collection will store an extra `thumb` conversion.
Use `mediaService.urlFor(media, 'thumb')` to retrieve the resized image.

### Programmatic Usage

Attach an uploaded file to the `avatar` collection for a user and retrieve a conversion URL:

```ts
await mediaService.attachFile({
  modelType: 'users',
  modelId: user.id,
  collection: 'avatar',
  file: { buffer: file.buffer, originalname: file.originalname, mimetype: file.mimetype, size: file.size }
});
const avatarUrl = await mediaable(user).firstUrl('avatar', 'thumb');
```

If the file is already uploaded to storage, insert a record directly:

```ts
await mediaService.insertRecord({
  modelType: 'users',
  modelId: user.id,
  collection: 'avatar',
  fileName: 'existing-file.png',
  mimeType: 'image/png',
  size: 1234
});
```

---

## 📦 Build & Start Production

```bash
npm run build
npm start
```

### Health Check

The server exposes `/api/health` to report uptime and version information.

---

## ✨ Built With

- TypeScript + Node.js
- Express
- Prisma ORM + PostgreSQL
- Redis
- Zod (validation)
- Helmet & compression
- Supertest + Jest
- Sentry (telemetry ready)
- Modular directory structure

---

> Built for scale. Designed for clarity.
