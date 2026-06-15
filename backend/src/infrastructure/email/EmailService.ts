import nodemailer from "nodemailer";
import { env } from "../../shared/config/env";
import { logger } from "../logger";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT),
      secure: parseInt(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(to: string, name: string, code: string): Promise<void> {
    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 0;">
        <div style="font-size: 11px; color: #666; letter-spacing: 0.08em; margin-bottom: 24px;">RECRU·AI</div>
        <h2 style="color: #e0e0e0; font-size: 20px; font-weight: 500;">Verify your email</h2>
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          Hi ${name}, use the code below to verify your email address and complete your registration.
        </p>
        <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 600; color: #fff; letter-spacing: 0.15em;">${code}</span>
        </div>
        <p style="color: #666; font-size: 12px;">
          This code expires in 15 minutes. If you didn't create an account, ignore this email.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"RECRU·AI" <${env.SMTP_FROM}>`,
        to,
        subject: "Verify your email — RECRU·AI",
        html,
      });
      logger.info(`Verification email sent to ${to}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${to}:`, error);
      throw new Error("Failed to send verification email");
    }
  }

  async sendInterviewInvite(
    to: string,
    candidateName: string,
    jobTitle: string,
    roundNumber: number,
    scheduledAt: Date
  ): Promise<void> {
    const dateStr = scheduledAt.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 0;">
        <div style="font-size: 11px; color: #666; letter-spacing: 0.08em; margin-bottom: 24px;">RECRU·AI</div>
        <h2 style="color: #e0e0e0; font-size: 20px; font-weight: 500;">Interview Scheduled</h2>
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          Hi ${candidateName}, your Round ${roundNumber} interview for <strong style="color: #e0e0e0;">${jobTitle}</strong> has been scheduled.
        </p>
        <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <div style="color: #666; font-size: 12px; margin-bottom: 4px;">DATE & TIME</div>
          <div style="color: #fff; font-size: 16px;">${dateStr}</div>
        </div>
        <p style="color: #666; font-size: 12px;">
          Please be prepared and join on time. Good luck!
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"RECRU·AI" <${env.SMTP_FROM}>`,
        to,
        subject: `Interview Scheduled: ${jobTitle} — Round ${roundNumber}`,
        html,
      });
      logger.info(`Interview invite sent to ${to}`);
    } catch (error) {
      logger.error(`Failed to send interview invite to ${to}:`, error);
    }
  }

  async sendStatusUpdate(
    to: string,
    candidateName: string,
    jobTitle: string,
    status: string
  ): Promise<void> {
    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 0;">
        <div style="font-size: 11px; color: #666; letter-spacing: 0.08em; margin-bottom: 24px;">RECRU·AI</div>
        <h2 style="color: #e0e0e0; font-size: 20px; font-weight: 500;">Application Update</h2>
        <p style="color: #999; font-size: 14px; line-height: 1.6;">
          Hi ${candidateName}, your application for <strong style="color: #e0e0e0;">${jobTitle}</strong> has been updated.
        </p>
        <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <div style="color: #666; font-size: 12px; margin-bottom: 4px;">STATUS</div>
          <div style="color: #fff; font-size: 16px; text-transform: capitalize;">${status.toLowerCase().replace("_", " ")}</div>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"RECRU·AI" <${env.SMTP_FROM}>`,
        to,
        subject: `Application Update: ${jobTitle} — RECRU·AI`,
        html,
      });
      logger.info(`Status update email sent to ${to}`);
    } catch (error) {
      logger.error(`Failed to send status email to ${to}:`, error);
    }
  }
}

export const emailService = new EmailService();
