import { UserRole } from "../value-objects/UserRole";

export interface UserProps {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  verificationCode?: string;
  verificationExpires?: Date;
  createdAt?: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get email() { return this.props.email; }
  get password() { return this.props.password; }
  get role() { return this.props.role; }
  get isVerified() { return this.props.isVerified; }
  get verificationCode() { return this.props.verificationCode; }
  get verificationExpires() { return this.props.verificationExpires; }
  get createdAt() { return this.props.createdAt; }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
    };
  }
}