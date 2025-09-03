import { ObjectId } from "mongodb";
import { Todo } from "../models/Todo";

export class TodoEntity implements Partial<Todo> {
  _id?: ObjectId;
  id?: number;
  userId?: number;
  title!: string;
  description!: string;
  completed: boolean = false;

  static collectionName = "todos";

  constructor(data: Partial<Todo & { _id?: ObjectId }>) {
    if (data._id) this._id = data._id;
    if (data.id) this.id = data.id;
    if (data.userId) this.userId = data.userId;
    if (data.title) this.title = data.title;
    if (data.description) this.description = data.description;
    if (typeof data.completed === "boolean") this.completed = data.completed;
  }

  toDocument() {
    const doc: any = {
      title: this.title,
      description: this.description,
      completed: this.completed,
    };
    if (this.userId) doc.userId = this.userId;
    if (this.id) doc.id = this.id;
    if (this._id) doc._id = this._id;
    return doc;
  }
}
