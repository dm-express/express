import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { CreateTodoDto, UpdateTodoDto } from '../validators/todo.dto';
import { Todo } from '../models/Todo';

// In-memory todo storage
let todos: Todo[] = [];
let todoId = 1;

export const createTodo = async (req: Request, res: Response) => {
  const dto = Object.assign(new CreateTodoDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json(errors);
  }
  const todo: Todo = {
    id: todoId++,
    userId: req.body.userId, // Should be set from auth in real app
    title: dto.title,
    description: dto.description,
    completed: false,
  };
  todos.push(todo);
  res.status(201).json(todo);
};

export const getTodos = (req: Request, res: Response) => {
  res.json(todos);
};

export const getTodo = (req: Request, res: Response) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  res.json(todo);
};

export const updateTodo = async (req: Request, res: Response) => {
  const todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  const dto = Object.assign(new UpdateTodoDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json(errors);
  }
  if (dto.title) todo.title = dto.title;
  if (dto.description) todo.description = dto.description;
  res.json(todo);
};

export const deleteTodo = (req: Request, res: Response) => {
  todos = todos.filter(t => t.id !== Number(req.params.id));
  res.status(204).send();
};
