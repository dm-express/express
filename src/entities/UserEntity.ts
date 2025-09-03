import { ObjectId } from "mongodb";
import { User } from "../models/User";

/**
 * Simple User entity class to represent user documents.
 * The app currently uses TypeScript interfaces in `src/models/User.ts`.
 * This class helps creating typed documents before inserting into MongoDB.
 */
export class UserEntity implements Partial<User> {
  _id?: ObjectId;
  id?: number;
  name!: string;
  email!: string;
  password!: string; // hashed

  static collectionName = "users";

  constructor(data: Partial<User & { _id?: ObjectId }>) {
    if (data._id) this._id = data._id;
    if (data.id) this.id = data.id;
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    if (data.password) this.password = data.password;
  }

  toDocument() {
    const doc: any = {
      name: this.name,
      email: this.email,
      password: this.password,
    };
    if (this.id) doc.id = this.id;
    if (this._id) doc._id = this._id;
    return doc;
  }
}
