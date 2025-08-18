import app from "./app";

// Entry point for compiled JS
// This file is used after TypeScript compilation

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
