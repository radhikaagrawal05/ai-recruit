import multer from "multer";
import path from "path";
import { AppError } from "../errors/AppError";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

export const uploadResume = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Only PDF and DOCX files are allowed", 400));
    }
  },
}).single("resume");

export const uploadCode = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for code
}).single("code");
