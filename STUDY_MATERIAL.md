# Study Material: Beginner Express + TypeScript API

This document explains every part of the sample Express + TypeScript project in this repository. It's written for students who want a clear, practical walkthrough of how the app is structured and how the pieces interact.

---

## Quick plan & checklist

- [x] Readable overview and goals
- [x] Project structure with purpose for each file/folder
- [x] File-by-file explanations and key code patterns
- [x] Request flow (how a request travels through the app)
- [x] Validation with `class-validator` (how DTOs are used)
- [x] Authentication (JWT) and password hashing (bcrypt)
- [x] File uploads with `multer`
- [x] How to run, build, and test locally
- [x] Security notes, extensions, and exercises for learning

---

## 1. Project overview

This is a beginner-friendly REST API demonstrating:

- TypeScript + Express
- MVC-style separation (models, controllers, routes)
- Request validation using `class-validator` DTOs
- Authentication using JSON Web Tokens (JWT)
- Password hashing with `bcrypt`
- File uploads using `multer`
- Simple in-memory storage for demo purposes (replace with a DB later)

Goal: learn how these components fit together so you can extend the app or port the concepts to your own projects.

---

## 2. Project structure (what each item is for)

```
backend/
  src/
    controllers/    # Request handlers (business logic)
    models/         # TypeScript interfaces for data shapes
    routes/         # Express route definitions
    middlewares/    # Logger, auth, and error handling
    validators/     # DTOs using class-validator
    app.ts          # App setup, middlewares, and route mounting
    index.ts        # Server start (calls app.listen)
  uploads/          # Where uploaded files are saved (runtime)
  package.json
  tsconfig.json
  README.md
  api-curl-examples.md
  STUDY_MATERIAL.md  # <-- this file
```

---

## 3. File-by-file explanation (key files)

### `package.json`

- Lists dependencies and scripts.
- Typical scripts:
  - `build` → runs TypeScript compiler (tsc)
  - `start` → builds and runs compiled output (`dist/index.js`)
- Install with `npm install`.

### `tsconfig.json`

- Configures TypeScript compilation.
- Important flags for this project:
  - `experimentalDecorators` and `emitDecoratorMetadata` — required by `class-validator`.
  - `rootDir: src`, `outDir: dist` — places compiled JS in `dist/`.

### `src/app.ts`

- Creates and configures the Express `app` instance.
- Adds global middlewares (CORS, body parsing, logger).
- Mounts routes (e.g., `/users`, `/todos`).
- Exports `app` so tests can import it without starting a server.

### `src/index.ts`

- Starts the server by importing `app` and calling `app.listen(...)`.
- Separating startup from app configuration improves testability.

### `src/routes/*.ts`

- Define endpoints and map them to controller functions.
- Keep routes minimal: leave business logic to controllers.
- Example: `userRoutes.ts` contains `POST /users`, `POST /users/login`, and `POST /users/avatar`.

### `src/controllers/*.ts`

- Implement request handling and business logic.
- Typical controller flow:
  1. Build DTO from `req.body` (e.g., `Object.assign(new CreateUserDto(), req.body)`).
  2. Call `validate(dto)` from `class-validator` and return 400 on errors.
  3. Perform logic (hash password, create record, sign JWT).
  4. Return response (omit hashed password in responses).

Key controllers in this project:

- `userController.ts` — user CRUD, login (returns JWT), uses DTOs + bcrypt + jwt
- `todoController.ts` — todo CRUD, validates DTOs
- `avatarController.ts` — uses `multer` for file uploads and returns file info

### `src/models/*.ts`

- Simple TypeScript interfaces describing shapes used in-app (User, Todo).
- Example `User` interface: `{ id: number; name: string; email: string; password: string }`.

### `src/validators/*.ts` (DTOs)

- DTOs use `class-validator` decorators to declare rules:
  - `@IsString()`, `@MinLength(2)`, `@IsEmail()`, etc.
- Controllers create DTO instances and run `validate(dto)` to get constraint violations.

Example DTO (CreateUserDto):

```ts
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
```

### `src/middlewares/logger.ts`

- Logs incoming request method and URL and calls `next()`.
- Good first middleware for understanding request flow.

### `src/middlewares/errorHandler.ts`

- Global error handler catches errors forwarded with `next(err)` and returns JSON with status 500.

### `src/middlewares/auth.ts`

- `authenticateToken` reads `Authorization` header (format: `Bearer <token>`), verifies token with `jwt.verify`, attaches payload to `req.user` and calls `next()`.
- Returns 401 for missing token, 403 for invalid token.

### `uploads/` folder

- Contains files saved by `multer` when handling uploads.
- Ensure `uploads/` exists and add it to `.gitignore` if you don't want to commit files.

---

## 4. Request flow (step-by-step)

1. Client sends HTTP request to an endpoint (e.g. `POST /users`).
2. Express routes find the matching path in `src/routes/*`.
3. Route middleware (if any) runs (e.g. `authenticateToken`, `multer` file parser).
4. Controller runs: constructs DTO, validates with `class-validator`.
5. If validation passes, controller performs logic (hash password, sign token).
6. Controller sends a response (JSON). If an error occurs, it reaches `errorHandler`.

---

## 5. Validation with `class-validator`

- DTOs declare constraints using decorators.
- In controllers:

```ts
const dto = Object.assign(new CreateUserDto(), req.body);
const errors = await validate(dto);
if (errors.length) return res.status(400).json(errors);
```

- Validation errors are detailed objects. For user-friendly messages, map them to strings.

---

## 6. Authentication (JWT) & hashing (bcrypt)

- Password storage: use `bcrypt.hash(password, saltRounds)` before saving.
- Login: `bcrypt.compare(plainText, hashed)` to verify password.
- Create token: `const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' })`.
- Protect routes: `authenticateToken` middleware verifies token and attaches payload.

Security recommendations:

- Never hard-code `JWT_SECRET`. Use environment variables and add `.env` to `.gitignore`.
- Use HTTPS in production.
- Limit CORS to allowed origins.
- Use short token expiry and consider refresh tokens.

---

## 7. File uploads with `multer`

- Configure multer storage (`diskStorage`), set destination and filenames.
- Route uses `upload.single('avatar')` to parse a single file with field name `avatar`.
- Example route: `POST /users/avatar` protected by `authenticateToken`.
- Example cURL:

```bash
curl -X POST http://localhost:3000/users/avatar \
  -H "Authorization: Bearer <TOKEN>" \
  -F "avatar=@/path/to/avatar.jpg"
```

---

## 8. How to run locally (Windows PowerShell)

```powershell
cd "e:\Web Development Class\backend"
npm install
npm run build
npm start
```

- For development convenience, consider adding a `dev` script that runs `ts-node-dev` or `nodemon`.

---

## 9. Testing the API

- Use `api-curl-examples.md` included in the repo for cURL commands.
- Use Postman/Insomnia for easier exploration and to test headers and body formats.

---

## 10. Next steps & exercises for students

- Replace in-memory storage with a real database (SQLite/Postgres/MongoDB). Try Prisma or TypeORM.
- Add refresh tokens and token revocation.
- Add role-based access control for certain endpoints.
- Add unit tests for controllers and integration tests for routes.
- Add file validation (MIME type, size limit) for uploads.

Exercises:

1. Persist users to a simple SQLite DB using Prisma and update controllers.
2. Add an endpoint to serve user avatars (`GET /uploads/:filename`).
3. Implement a middleware that checks user ownership of a todo before allowing updates.

---

## 11. Troubleshooting common issues

- Decorator errors in TypeScript: enable `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`.
- `class-validator` returns empty: ensure DTO instance is created with `Object.assign(new Dto(), req.body)`.
- `multer` type errors: install `@types/multer`.
- JWT verify errors: ensure token is passed as `Authorization: Bearer <token>`.

---

## 12. Where to look in the code (quick pointers)

- App setup & route mounting: `src/app.ts`
- Server entry point: `src/index.ts`
- User logic: `src/controllers/userController.ts`
- Todo logic: `src/controllers/todoController.ts`
- Auth middleware: `src/middlewares/auth.ts`
- DTOs: `src/validators/*.ts`
- cURL examples: `api-curl-examples.md`

---
