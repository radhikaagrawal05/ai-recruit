import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { UserRole } from "../../domain/value-objects/UserRole";
import bcrypt from "bcrypt";
import { ConflictError } from "../../../../shared/errors/AppError";

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export class RegisterUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: RegisterUserDTO): Promise<{ user: User; verificationCode: string }> {
    // 1. Check duplicate
    const alreadyExists = await this.userRepository.exists(dto.email);
    if (alreadyExists) {
      throw new ConflictError("User with this email already exists");
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 4. Create and save user
    const user = new User({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      isVerified: true, // Bypass email verification for now
      verificationCode,
      verificationExpires,
    });

    const savedUser = await this.userRepository.save(user);
    return { user: savedUser, verificationCode };
  }
}