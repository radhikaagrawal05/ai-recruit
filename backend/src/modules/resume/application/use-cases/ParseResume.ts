import pdf from "pdf-parse";
import mammoth from "mammoth";

export class ParseResume {
  async execute(fileBuffer: Buffer, mimetype: string): Promise<string> {
    if (mimetype === "application/pdf") {
      const data = await pdf(fileBuffer);
      return data.text.trim();
    }

    if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value.trim();
    }

    throw new Error("Unsupported file type. Only PDF and DOCX are supported.");
  }
}
