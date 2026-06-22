import * as XLSX from "xlsx";
import { ICandidateRepository } from "../../domain/repositories/ICandidateRepository";
import { Candidate } from "../../domain/entities/Candidate";
import { CandidateStatus } from "../../domain/value-objects/CandidateStatus";
import { IFileStorage } from "../../../../infrastructure/storage/IFileStorage";
import { ParseResume } from "../../../resume/application/use-cases/ParseResume";
import { logger } from "../../../../infrastructure/logger";
import { extractDriveFileId, downloadDriveFile } from "../../../../shared/utils/driveHelper";

export class BulkAddCandidates {
  constructor(
    private candidateRepository: ICandidateRepository,
    private fileStorage: IFileStorage
  ) {}

  async execute(fileBuffer: Buffer, jobId: string): Promise<{ total: number; added: number; updated: number }> {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    let added = 0;
    let updated = 0;

    const parser = new ParseResume();

    for (const row of rows) {
      // Fuzzy matching column names
      const nameKey = Object.keys(row).find(k => k.toLowerCase().includes("name")) || "Name";
      const emailKey = Object.keys(row).find(k => k.toLowerCase().includes("email")) || "Email";
      const phoneKey = Object.keys(row).find(k => k.toLowerCase().includes("phone") || k.toLowerCase().includes("contact")) || "Phone";
      const resumeKey = Object.keys(row).find(k => k.toLowerCase().includes("resume") || k.toLowerCase().includes("cv") || k.toLowerCase().includes("link")) || "Resume";

      const name = row[nameKey];
      const email = row[emailKey];
      const phone = row[phoneKey] ? String(row[phoneKey]) : undefined;
      const resumeLink = row[resumeKey];

      if (!email || !name) {
        continue; // Skip invalid rows
      }

      let resumeUrl = resumeLink || "";
      let resumeText = "";

      // Check if it's a drive link
      if (resumeLink && typeof resumeLink === "string" && resumeLink.includes("drive.google.com")) {
        const fileId = extractDriveFileId(resumeLink);
        if (fileId) {
          try {
            const resumeBuffer = await downloadDriveFile(fileId);
            
            // Upload to our local storage / S3
            const ext = "pdf"; // Assume pdf for drive links usually, or docx
            const key = `resumes/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            resumeUrl = await this.fileStorage.upload(resumeBuffer, key, "application/pdf");

            // Auto-parse for AI
            resumeText = await parser.execute(resumeBuffer, "application/pdf");
            logger.info(`Resume from Drive parsed successfully: ${resumeText.length} chars extracted`);
          } catch (err: any) {
            logger.warn(`Failed to process drive link ${resumeLink}: ${err.message}`);
          }
        }
      }

      // Deduplication: prevent creating duplicate jobs and consider the latest filled form
      const existingCandidate = await this.candidateRepository.findByEmailAndJobId(email, jobId);
      
      if (existingCandidate) {
        // Update existing candidate
        await this.candidateRepository.update(existingCandidate.id!, {
          name,
          phone: phone || existingCandidate.phone,
          resumeUrl: resumeUrl || existingCandidate.resumeUrl,
          resumeText: resumeText || existingCandidate.resumeText,
          // Reset status to applied if they re-submitted? Or keep existing status. Let's keep existing status.
        });
        updated++;
      } else {
        // Create new candidate
        const candidate = new Candidate({
          name,
          email,
          phone,
          jobId,
          resumeUrl,
          resumeText,
          status: CandidateStatus.APPLIED,
        });
        await this.candidateRepository.save(candidate);
        added++;
      }
    }

    return { total: rows.length, added, updated };
  }
}
