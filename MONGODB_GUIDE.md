# MongoDB Quick Guide

This short guide explains basic MongoDB concepts and shows simple examples for common operations (insert, find, update, delete) using the helper in `src/db/mongodb.ts`.

## Basic concepts

- Database: a named container for collections (e.g., `mydb`).
- Collection: like a table in SQL; stores documents (e.g., `users`).
- Document: a JSON-like record (BSON) stored in a collection.

MongoDB is schema-flexible — documents in the same collection can have different fields. This is convenient but you should still validate input on the server side (we use TypeScript DTOs and `class-validator`).

## Using the project helper

First install the driver if you haven't:

```bash
npm install mongodb
npm install --save-dev @types/mongodb
```

Connect once at app startup (example):

```ts
import { connect } from "./src/db/mongodb";

await connect("mongodb://localhost:27017", "mydb");
```

All examples below assume you've called `connect()` already.

## Insert (create)

Insert a single document into the `users` collection:

```ts
import { insertOne } from "./src/db/mongodb";

const result = await insertOne("users", {
  name: "John",
  email: "john@example.com",
});
console.log("Inserted id:", result.insertedId);
```

Insert many:

```ts
import { insertMany } from "./src/db/mongodb";

await insertMany("users", [
  { name: "A", email: "a@example.com" },
  { name: "B", email: "b@example.com" },
]);
```

## Find (read)

Find multiple documents (returns array):

```ts
import { find } from "./src/db/mongodb";

const users = await find("users", { name: "John" });
console.log(users);
```

Find one document:

```ts
import { findOne } from "./src/db/mongodb";

const user = await findOne("users", { email: "john@example.com" });
```

### MongoDB shell examples

If you prefer using the MongoDB shell (`mongosh`) directly, here are equivalent commands:

```js
use mydb; // switch to database

// Insert a document
db.users.insertOne({ name: 'abc', email: 'abc@example.com' });

// Find multiple documents
db.users.find({ name: 'abc' }).toArray();

// Find one document
db.users.findOne({ name: 'abc' });

// Update a document
db.users.updateOne({ name: 'abc' }, { $set: { name: 'abc-updated' } });

// Delete a document
db.users.deleteOne({ name: 'abc' });
```

## Update

Update a single document (uses `$set`):

```ts
import { updateOne } from "./src/db/mongodb";

await updateOne(
  "users",
  { email: "john@example.com" },
  { name: "John Updated" }
);
```

For more complex updates, you can call the native `Collection` API via `getCollection()` exported by the helper.

## Delete

Delete a single document:

```ts
import { deleteOne } from "./src/db/mongodb";

await deleteOne("users", { email: "john@example.com" });
```

Delete many:

```ts
import { deleteMany } from "./src/db/mongodb";

await deleteMany("users", { name: { $in: ["A", "B"] } });
```

## Best practices

- Put `connect()` at application startup and reuse the `Db` instance.
- Use environment variables for connection string and db name.
- Validate input and sanitize fields before inserting into DB.
- Consider using an ORM/ODM (Prisma, TypeORM, Mongoose) for complex apps.

## Next steps

- Add a typed repository layer (e.g., `UserRepository`) that wraps helper functions for a single collection.
- Add transactions for multi-document/collection atomic operations.

That's it — a short reference for the helper and common MongoDB operations.
