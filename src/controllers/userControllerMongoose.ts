import { Request, Response } from "express";
import { validate } from "class-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CreateUserDto, UpdateUserDto } from "../validators/user.dto";
import UserModel from "../models/UserModel";
import { UserEntity } from "../entities/UserEntity";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

function isObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Create a new user (stores in MongoDB)
export const createUser = async (req: Request, res: Response) => {
  const dto = Object.assign(new CreateUserDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) return res.status(400).json(errors);

  // Check duplicate email
  const existing = await UserModel.findOne({ email: dto.email }).exec();
  if (existing)
    return res.status(409).json({ message: "Email already in use" });

  const hashedPassword = await bcrypt.hash(dto.password, 10);
  const entity = new UserEntity({
    name: dto.name,
    email: dto.email,
    password: hashedPassword,
  });
  const created = await UserModel.create(entity.toDocument());
  const obj = created.toObject();
  (obj as any).password = undefined;
  res.status(201).json(obj);
};

export const getUsers = async (req: Request, res: Response) => {
  const users = await UserModel.find().select("-password").lean().exec();
  res.json(users);
};

export const getUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  let user: any = null;
  if (isObjectId(id)) {
    user = await UserModel.findById(id).select("-password").lean().exec();
  } else {
    user = await UserModel.findOne({ id: Number(id) })
      .select("-password")
      .lean()
      .exec();
  }
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const dto = Object.assign(new UpdateUserDto(), req.body);
  const errors = await validate(dto);
  if (errors.length > 0) return res.status(400).json(errors);

  let filter: any = {};
  if (isObjectId(id)) filter = { _id: id };
  else filter = { id: Number(id) };

  const updateData: any = {};
  if (dto.name) updateData.name = dto.name;
  if (dto.email) updateData.email = dto.email;
  if (dto.password) updateData.password = await bcrypt.hash(dto.password, 10);

  // shape update using entity before applying
  const updateEntity = new UserEntity(updateData);
  const updated = await UserModel.findOneAndUpdate(
    filter,
    { $set: updateEntity.toDocument() },
    { new: true }
  )
    .select("-password")
    .lean()
    .exec();
  if (!updated) return res.status(404).json({ message: "User not found" });
  res.json(updated);
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  let result: any = null;
  if (isObjectId(id)) result = await UserModel.findByIdAndDelete(id).exec();
  else result = await UserModel.findOneAndDelete({ id: Number(id) }).exec();
  if (!result) return res.status(404).json({ message: "User not found" });
  res.status(204).send();
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email }).exec();
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
};
