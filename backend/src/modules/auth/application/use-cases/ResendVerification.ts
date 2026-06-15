import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { NotFoundError } from "../../../../shared/errors/AppError";
import { emailService } from "../../../../infrastructure/email/EmailService";

export class ResendVerification {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError("User");
    }

    if (user.isVerified) {
      return; // Already verified
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await this.userRepository.updateVerificationCode(user.id as string, code, expires);
    await emailService.sendVerificationEmail(user.email, user.name, code);
  }
}
