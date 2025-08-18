import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes";
import todoRoutes from "./routes/todoRoutes";
import { authenticateToken } from "./middlewares/auth";

const app = express();

app.use(cors());
// Cross Origin Resource Sharing

app.use(bodyParser.json());
// It converts the data in readable format

app.use(bodyParser.urlencoded({ extended: true }));
// urlencoded middleware parses the data eg: HTML Forms in the readable format for express framework

// Sequencial routing: Whichever endpoint and method is matched that route will be triggered.

// Public routes
app.use("/users", userRoutes);

// Protected TODO routes (require JWT)
app.use("/todos", authenticateToken, todoRoutes);

export default app;
