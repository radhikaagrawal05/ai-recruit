import { User } from "../entities/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  exists(email: string): Promise<boolean>;
  updateVerification(id: string, isVerified: boolean): Promise<void>;
  updateVerificationCode(id: string, code: string, expires: Date): Promise<void>;
}