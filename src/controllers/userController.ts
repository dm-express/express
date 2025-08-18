import { Request, Response } from "express";
import { validate } from "class-validator";
import bcrypt from "bcrypt"; // hash the password before storing in db
import jwt from "jsonwebtoken"; // library to create/validate the jwt token
import { CreateUserDto, UpdateUserDto } from "../validators/user.dto";
import { User } from "../models/User";

// In-memory user storage
let users: User[] = [];
let userId = 1;

const JWT_SECRET = "your_jwt_secret"; // Replace with env var in production

export const createUser = async (req: Request, res: Response) => {
  const dto = Object.assign(new CreateUserDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json(errors);
  }
  const hashedPassword = await bcrypt.hash(dto.password, 10);
  const user: User = {
    id: userId++,
    name: dto.name,
    email: dto.email,
    password: hashedPassword,
  };
  users.push(user); // db call to store the user in the db
  res.status(201).json({ ...user, password: undefined });
};

export const getUsers = (req: Request, res: Response) => {
  res.json(users.map((u) => ({ ...u, password: undefined })));
};

export const getUser = (req: Request, res: Response) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ ...user, password: undefined });
};

export const updateUser = async (req: Request, res: Response) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ message: "User not found" });
  const dto = Object.assign(new UpdateUserDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    return res.status(400).json(errors);
  }
  if (dto.name) user.name = dto.name;
  if (dto.email) user.email = dto.email;
  if (dto.password) user.password = await bcrypt.hash(dto.password, 10);
  res.json({ ...user, password: undefined });
};

export const deleteUser = (req: Request, res: Response) => {
  users = users.filter((u) => u.id !== Number(req.params.id));
  res.status(204).send();
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  // JWT token are used for user authentication
  // Can store any data in jwt, which is used for authenticating the requests eg: { userId: user.id }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
  // JWT expires in 1h, ideally tokens depends on nature of the application

  res.json({ token });
};
