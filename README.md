# Beginner Express MVC + TypeScript API

This project is a beginner-friendly RESTful API built with Express.js, TypeScript, and the MVC pattern. It demonstrates best practices for structure, validation, authentication, and CRUD operations for both users and todos.

## Features

- **TypeScript** for type safety
- **MVC Pattern** (Models, Controllers, Routes)
- **CORS** enabled
- **Middlewares** for logging, error handling, and JWT authentication
- **Form Data Handling** (JSON and URL-encoded)
- **class-validator** for request validation
- **bcrypt** for password hashing
- **jsonwebtoken** for authentication

## Getting Started

### 1. Clone the repository

```sh
git clone <your-repo-url>
cd backend
```

### 2. Install dependencies

```sh
npm install
```

### 3. Build the project

```sh
npm run build
```

### 4. Start the server

```sh
npm start
```

The server will run on `http://localhost:3000` by default.

---

## API Endpoints

### User Endpoints

| Method | Endpoint     | Description        | Auth Required |
| ------ | ------------ | ------------------ | ------------- |
| POST   | /users       | Create a new user  | No            |
| GET    | /users       | Get all users      | No            |
| GET    | /users/:id   | Get user by ID     | No            |
| PUT    | /users/:id   | Update user by ID  | No            |
| DELETE | /users/:id   | Delete user by ID  | No            |
| POST   | /users/login | Login, returns JWT | No            |

#### Example: Create User

```json
POST /users
{
   "name": "John Doe",
   "email": "john@example.com",
   "password": "yourpassword"
}
```

#### Example: Login

```json
POST /users/login
{
   "email": "john@example.com",
   "password": "yourpassword"
}
```

Response:

```json
{
  "token": "<jwt-token>"
}
```

---

### Todo Endpoints (Require JWT Auth)

| Method | Endpoint   | Description       | Auth Required |
| ------ | ---------- | ----------------- | ------------- |
| POST   | /todos     | Create a new todo | Yes           |
| GET    | /todos     | Get all todos     | Yes           |
| GET    | /todos/:id | Get todo by ID    | Yes           |
| PUT    | /todos/:id | Update todo by ID | Yes           |
| DELETE | /todos/:id | Delete todo by ID | Yes           |

#### Example: Create Todo

```json
POST /todos
Headers: { "Authorization": "Bearer <jwt-token>" }
{
   "title": "Learn Express",
   "description": "Build a REST API with TypeScript"
}
```

---

## Notes

- All request/response bodies are JSON.
- Use the JWT token from `/users/login` in the `Authorization` header for all `/todos` endpoints.
- This project uses in-memory storage for demo purposes. For production, connect to a real database.

---

## Project Structure

```
backend/
   src/
      controllers/    # Business logic
      models/         # Data models
      routes/         # API route definitions
      middlewares/    # Custom middlewares
      validators/     # DTOs and validation
      app.ts          # Express app setup
      index.ts        # Entry point
   package.json
   tsconfig.json
   README.md
```

---

## License

MIT
