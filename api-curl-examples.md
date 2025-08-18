# Example cURL Commands for API Testing

## User Endpoints

# Create a new user

curl -X POST http://localhost:3000/users \
 -H "Content-Type: application/json" \
 -d '{
"name": "John Doe",
"email": "john@example.com",
"password": "yourpassword"
}'

# Login (get JWT token)

curl -X POST http://localhost:3000/users/login \
 -H "Content-Type: application/json" \
 -d '{
"email": "john@example.com",
"password": "yourpassword"
}'

# Get all users

curl http://localhost:3000/users

# Get user by ID

curl http://localhost:3000/users/1

# Update user by ID

curl -X PUT http://localhost:3000/users/1 \
 -H "Content-Type: application/json" \
 -d '{
"name": "Jane Doe"
}'

# Delete user by ID

curl -X DELETE http://localhost:3000/users/1

## Todo Endpoints (Require JWT)

# Replace <TOKEN> with the JWT token from login

# Create a new todo

curl -X POST http://localhost:3000/todos \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <TOKEN>" \
 -d '{
"title": "Learn Express",
"description": "Build a REST API with TypeScript"
}'

# Get all todos

curl http://localhost:3000/todos \
 -H "Authorization: Bearer <TOKEN>"

# Get todo by ID

curl http://localhost:3000/todos/1 \
 -H "Authorization: Bearer <TOKEN>"

# Update todo by ID

curl -X PUT http://localhost:3000/todos/1 \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer <TOKEN>" \
 -d '{
"title": "Learn TypeScript"
}'

# Delete todo by ID

curl -X DELETE http://localhost:3000/todos/1 \
 -H "Authorization: Bearer <TOKEN>"

# Example: Form Data Request with File Upload (User Avatar)

# Upload an avatar for a user (requires JWT token)

curl -X POST http://localhost:3000/users/avatar \
 -H "Authorization: Bearer <TOKEN>" \
 -F "avatar=@/path/to/avatar.jpg"

# Replace /path/to/avatar.jpg with the path to your image file
