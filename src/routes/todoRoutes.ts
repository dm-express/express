import { Router } from "express";
import * as todoController from "../controllers/todoController";

const router = Router();

// TODO CRUD
router.post("/", todoController.createTodo);
router.get("/", todoController.getTodos);
router.get("/:id", todoController.getTodo);
router.put("/:id", todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);

export default router;
