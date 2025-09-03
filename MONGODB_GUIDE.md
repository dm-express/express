# MongoDB Quick Guide

This short guide explains basic MongoDB concepts and shows simple examples for common operations (insert, find, update, delete) using the helper in `src/db/mongodb.ts`.

## Basic concepts

- Database: a named container for collections (e.g., `mydb`).
- Collection: like a table in SQL; stores documents (e.g., `users`).
- Document: a JSON-like record (BSON) stored in a collection.

MongoDB is schema-flexible — documents in the same collection can have different fields. This is convenient but you should still validate input on the server side (we use TypeScript DTOs and `class-validator`).

## Using the project helper

First install the driver if you haven't:

````bash
# MongoDB & Mongoose Guide

This project uses Mongoose as the primary ODM for MongoDB. This short guide explains the current setup, where code lives, and shows examples using the project's Mongoose models and entity classes.

## What changed
- Replaced ad-hoc native-driver helper usage with Mongoose models for main data flows.
- New connection helper: `src/db/mongoose.ts` (exports `connectMongoose` / `disconnectMongoose`).
- Mongoose models live in `src/models/` (`UserModel.ts`, `TodoModel.ts`).
- Entity classes live in `src/entities/` (`UserEntity.ts`, `TodoEntity.ts`) and provide `toDocument()` helpers to shape data before persisting.
- Controllers (`src/controllers/*ControllerMongoose.ts`) now validate DTOs (`class-validator`), use entities to shape payloads, and call Mongoose models.

## Install

If you haven't already:

```powershell
npm install mongoose dotenv
````

Mongoose includes TypeScript types; you don't normally need `@types/mongoose`.

## Connection helper (where to call it)

Use the project's helper in `src/db/mongoose.ts` to connect at startup. Example (in `src/index.ts`):

```ts
import { connectMongoose } from "./src/db/mongoose";
import app from "./src/app";

async function start() {
  await connectMongoose(
    process.env.MONGO_URI || "mongodb://localhost:27017/mydb"
  );
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`Listening on ${port}`));
}

start();
```

Environment variables used by the connection and app:

- `MONGO_URI` — full connection string (e.g. `mongodb://localhost:27017/mydb` or Atlas URI)
- `JWT_SECRET`, `PORT` — used elsewhere in the app (auth/server)

## Models (what exists)

- `src/models/UserModel.ts` — User schema (example fields: `name`, `email` (unique), `password` (hashed)).
- `src/models/TodoModel.ts` — Todo schema (example fields: `userId`, `title`, `description`, `completed`).

These models are plain Mongoose models and are used in controllers directly. For read operations the code uses `.lean()` and `.select('-password')` where appropriate.

## Entities (why and how)

Entity classes are in `src/entities` and help centralize object shaping before writing to the DB. Each entity exposes `toDocument()` which returns a plain object suitable for `Model.create()` or `$set` updates.

Example: `src/entities/UserEntity.ts` and `src/entities/TodoEntity.ts`.

Create using an entity to ensure shape consistency:

```ts
import { UserEntity } from "../entities/UserEntity";
import UserModel from "../models/UserModel";
import bcrypt from "bcrypt";

const hashed = await bcrypt.hash(password, 10);
const userEntity = new UserEntity({ name, email, password: hashed });
const created = await UserModel.create(userEntity.toDocument());
```

On updates controllers build an entity from the allowed update fields then apply `updateEntity.toDocument()` in the update call or assign it to a found document before saving.

## Controllers and validation

Controllers in `src/controllers/*ControllerMongoose.ts` follow this pattern:

1. Create DTO instance and run `validate(dto)` (from `class-validator`).
2. If invalid, return `400` with validation errors.
3. Use entities (`UserEntity`, `TodoEntity`) to shape create/update payloads.
4. Use Mongoose models to persist/read data. On read, `.lean()` is used for simple JSON results and sensitive fields are excluded (for example `select('-password')`).
5. Auth checks (ownership) are performed using the decoded JWT available via the `auth` middleware (payload like `{ userId }`).

Example create flow (user):

```ts
// inside controller
const dto = Object.assign(new CreateUserDto(), req.body);
const errors = await validate(dto);
if (errors.length) return res.status(400).json(errors);

const hashed = await bcrypt.hash(dto.password, 10);
const entity = new UserEntity({
  name: dto.name,
  email: dto.email,
  password: hashed,
});
const created = await UserModel.create(entity.toDocument());
const out = created.toObject();
(out as any).password = undefined; // remove password before sending
res.status(201).json(out);
```

Example update flow (todo):

```ts
const dto = Object.assign(new UpdateTodoDto(), req.body);
const errors = await validate(dto);
if (errors.length) return res.status(400).json(errors);

const updates: any = {};
if (dto.title) updates.title = dto.title;
if (dto.description) updates.description = dto.description;
if (typeof dto.completed === "boolean") updates.completed = dto.completed;

const entity = new TodoEntity(updates);
Object.assign(todoDoc, entity.toDocument());
await todoDoc.save();
```

## Quick CRUD examples (Mongoose + entities)

Create:

```ts
const newTodo = new TodoEntity({ userId, title: "Buy milk", description: "" });
await TodoModel.create(newTodo.toDocument());
```

Find:

```ts
const todos = await TodoModel.find({ userId }).lean().exec();
```

Update:

```ts
await TodoModel.findByIdAndUpdate(
  id,
  { $set: new TodoEntity({ title: "x" }).toDocument() },
  { new: true }
).lean();
```

Delete:

```ts
await TodoModel.findByIdAndDelete(id).exec();
```

## When to use the old helper (if still present)

If `src/db/mongodb.ts` still exists in the repo, treat it as a legacy helper for direct driver access. Prefer Mongoose models for app-level domain logic because:

- Mongoose schemas and models provide validation, middleware/hooks, and an easier mapping to TypeScript models.
- Entities keep a single shape definition for create/update payloads that can be reused outside controllers.

Use the native helper only when you need low-level driver features or for quick scripts that should avoid Mongoose bootstrapping.

## Best practices and notes

- Call `connectMongoose()` once during startup and `disconnectMongoose()` during shutdown.
- Use `.lean()` on read queries when you just need plain JSON and don't need Mongoose document methods.
- Exclude sensitive fields with `.select('-password')`.
- Index unique fields (email) at the schema level to enforce uniqueness.
- For multi-document atomic operations use Mongoose transactions (sessions).

## Shell / mongosh tips

To query by ObjectId in `mongosh`:

```js
use mydb;
db.users.find({ _id: ObjectId('SOMEOBJECTID') });
```

## Next steps

- Add a repository layer to centralize data access and entity mapping.
- Add seeds and simple integration tests targeting an in-memory MongoDB (e.g., `mongodb-memory-server`) for CI.

This guide reflects the current Mongoose-first architecture used across the project. If you want me to also update README or code comments to link to this guide, I can do that next.
