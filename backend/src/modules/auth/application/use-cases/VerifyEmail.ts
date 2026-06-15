import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UnauthorizedError } from "../../../../shared/errors/AppError";

export interface VerifyEmailDTO {
  email: string;
  code: string;
}

export class VerifyEmail {
  constructor(private userRepository: IUserRepository) {}

  async execute(dto: VerifyEmailDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (user.isVerified) {
      return; // Already verified
    }

    if (!user.verificationCode || !user.verificationExpires) {
      throw new UnauthorizedError("No verification code found. Please register again.");
    }

    if (new Date() > user.verificationExpires) {
      throw new UnauthorizedError("Verification code has expired. Please request a new one.");
    }

    if (user.verificationCode !== dto.code) {
      throw new UnauthorizedError("Invalid verification code");
    }

    await this.userRepository.updateVerification(user.id as string, true);
  }
}
