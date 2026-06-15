import { JobStatus } from "../value-objects/JobStatus";

export interface JobProps {
  id?: string;
  title: string;
  department: string;
  description: string;
  requiredSkills: string[];
  experienceLevel?: string;
  location?: string;
  status: JobStatus;
  createdBy: string;
  createdAt?: Date;
}

export class Job {
  private props: JobProps;

  constructor(props: JobProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get title() { return this.props.title; }
  get department() { return this.props.department; }
  get description() { return this.props.description; }
  get requiredSkills() { return this.props.requiredSkills; }
  get experienceLevel() { return this.props.experienceLevel; }
  get location() { return this.props.location; }
  get status() { return this.props.status; }
  get createdBy() { return this.props.createdBy; }
  get createdAt() { return this.props.createdAt; }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      department: this.department,
      description: this.description,
      requiredSkills: this.requiredSkills,
      experienceLevel: this.experienceLevel,
      location: this.location,
      status: this.status,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
    };
  }
}