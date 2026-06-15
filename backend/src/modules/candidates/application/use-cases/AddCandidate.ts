import { ICandidateRepository } from "../../domain/repositories/ICandidateRepository";
import { Candidate } from "../../domain/entities/Candidate";
import { CandidateStatus } from "../../domain/value-objects/CandidateStatus";
import { IFileStorage } from "../../../../infrastructure/storage/IFileStorage";

export interface AddCandidateDTO {
  name: string;
  email: string;
  phone?: string;
  jobId: string;
  resumeBuffer?: Buffer;
  resumeMimetype?: string;
  resumeOriginalName?: string;
}

export class AddCandidate {
  constructor(
    private candidateRepository: ICandidateRepository,
    private fileStorage: IFileStorage
  ) {}

  async execute(dto: AddCandidateDTO): Promise<Candidate> {
    let resumeUrl = "";

    // Upload resume if provided
    if (dto.resumeBuffer && dto.resumeOriginalName) {
      const ext = dto.resumeOriginalName.split(".").pop();
      const key = `resumes/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      resumeUrl = await this.fileStorage.upload(
        dto.resumeBuffer,
        key,
        dto.resumeMimetype || "application/pdf"
      );
    }

    const candidate = new Candidate({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      jobId: dto.jobId,
      resumeUrl,
      status: CandidateStatus.APPLIED,
    });

    return this.candidateRepository.save(candidate);
  }
}
