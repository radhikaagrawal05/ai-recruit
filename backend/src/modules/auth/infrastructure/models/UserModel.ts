import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../../domain/value-objects/UserRole";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  verificationCode?: string;
  verificationExpires?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name:                { type: String, required: true },
    email:               { type: String, required: true, unique: true, lowercase: true },
    password:            { type: String, required: true },
    role:                { type: String, enum: Object.values(UserRole), required: true },
    isVerified:          { type: Boolean, default: false },
    verificationCode:    { type: String },
    verificationExpires: { type: Date },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>("User", UserSchema);