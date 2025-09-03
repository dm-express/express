import { Request, Response } from "express";
import { validate } from "class-validator";
import mongoose from "mongoose";
import { CreateTodoDto, UpdateTodoDto } from "../validators/todo.dto";
import TodoModel from "../models/TodoModel";
import { TodoEntity } from "../entities/TodoEntity";

function getAuthUserId(req: Request) {
  return (req as any).user?.userId;
}

function isObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export const createTodo = async (req: Request, res: Response) => {
  const dto = Object.assign(new CreateTodoDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) return res.status(400).json(errors);

  // Prefer authenticated user id; fallback to provided userId
  const authUserId = getAuthUserId(req);
  const userId = authUserId || dto["userId"] || null;

  const entity = new TodoEntity({
    userId,
    title: dto.title,
    description: dto.description,
    completed: false,
  });
  const created = await TodoModel.create(entity.toDocument());
  const obj = created.toObject();
  res.status(201).json(obj);
};

export const getTodos = async (req: Request, res: Response) => {
  const authUserId = getAuthUserId(req);
  const filter: any = {};
  if (authUserId) filter.userId = authUserId;
  const todos = await TodoModel.find(filter).lean().exec();
  res.json(todos);
};

export const getTodo = async (req: Request, res: Response) => {
  const id = req.params.id;
  const authUserId = getAuthUserId(req);

  let todo: any = null;
  if (isObjectId(id)) todo = await TodoModel.findById(id).lean().exec();
  else
    todo = await TodoModel.findOne({ id: Number(id) })
      .lean()
      .exec();

  if (!todo) return res.status(404).json({ message: "Todo not found" });

  // Ownership check when auth is present
  if (authUserId && String(todo.userId) !== String(authUserId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json(todo);
};

export const updateTodo = async (req: Request, res: Response) => {
  const id = req.params.id;
  const dto = Object.assign(new UpdateTodoDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) return res.status(400).json(errors);

  const authUserId = getAuthUserId(req);
  let filter: any = {};
  if (isObjectId(id)) filter = { _id: id };
  else filter = { id: Number(id) };

  const todo = await TodoModel.findOne(filter).exec();
  if (!todo) return res.status(404).json({ message: "Todo not found" });

  if (authUserId && String(todo.userId) !== String(authUserId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // apply updates via entity to keep shape consistent
  const updates: any = {};
  if (dto.title) updates.title = dto.title;
  if (dto.description) updates.description = dto.description;
  if (typeof dto["completed"] === "boolean")
    updates.completed = dto["completed"];

  const updateEntity = new TodoEntity(updates);
  Object.assign(todo, updateEntity.toDocument());

  await todo.save();
  const out = todo.toObject();
  res.json(out);
};

export const deleteTodo = async (req: Request, res: Response) => {
  const id = req.params.id;
  const authUserId = getAuthUserId(req);

  let todo: any = null;
  if (isObjectId(id)) todo = await TodoModel.findById(id).exec();
  else todo = await TodoModel.findOne({ id: Number(id) }).exec();

  if (!todo) return res.status(404).json({ message: "Todo not found" });
  if (authUserId && String(todo.userId) !== String(authUserId)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await todo.deleteOne();
  res.status(204).send();
};

export default {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
};
