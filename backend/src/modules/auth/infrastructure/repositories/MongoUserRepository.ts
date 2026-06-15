import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { UserModel } from "../models/UserModel";

export class MongoUserRepository implements IUserRepository {

  private toEntity(doc: any): User {
    return new User({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      role: doc.role,
      isVerified: doc.isVerified,
      verificationCode: doc.verificationCode,
      verificationExpires: doc.verificationExpires,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email });
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async save(user: User): Promise<User> {
    const doc = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      isVerified: user.isVerified,
      verificationCode: user.verificationCode,
      verificationExpires: user.verificationExpires,
    });
    return this.toEntity(doc);
  }

  async exists(email: string): Promise<boolean> {
    const doc = await UserModel.findOne({ email });
    return !!doc;
  }

  async updateVerification(id: string, isVerified: boolean): Promise<void> {
    await UserModel.findByIdAndUpdate(id, {
      isVerified,
      $unset: { verificationCode: 1, verificationExpires: 1 },
    });
  }

  async updateVerificationCode(id: string, code: string, expires: Date): Promise<void> {
    await UserModel.findByIdAndUpdate(id, {
      verificationCode: code,
      verificationExpires: expires,
    });
  }
}