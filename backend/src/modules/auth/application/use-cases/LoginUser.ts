import { IUserRepository } from "../../domain/repositories/IUserRepository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../../../shared/config/env";
import { UnauthorizedError } from "../../../../shared/errors/AppError";

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class LoginUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: LoginUserDTO): Promise<LoginResult> {
    // 1. Find user
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // 2. Check if email is verified (Bypassed for now)
    // if (!user.isVerified) {
    //   throw new UnauthorizedError("Please verify your email before logging in");
    // }

    // 3. Check password
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // 4. Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: {
        id: user.id as string,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}