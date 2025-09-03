import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITodo extends Document {
  userId: mongoose.Types.ObjectId | number;
  title: string;
  description: string;
  completed: boolean;
}

const TodoSchema: Schema<ITodo> = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const TodoModel: Model<ITodo> =
  mongoose.models.Todo || mongoose.model<ITodo>("Todo", TodoSchema);

export default TodoModel;
