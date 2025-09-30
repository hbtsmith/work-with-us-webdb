import { promises as fs } from 'fs';
import path from 'path';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export async function saveUploadedFile(
  file: Buffer,
  filename: string,
  uploadDir: string
): Promise<string> {
  // Ensure upload directory exists
  await fs.mkdir(uploadDir, { recursive: true });
  
  // Generate unique filename
  const timestamp = Date.now();
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);
  const uniqueFilename = `${baseName}-${timestamp}${ext}`;
  
  const filePath = path.join(uploadDir, uniqueFilename);
  
  // Save file
  await fs.writeFile(filePath, file);
  
  return uniqueFilename;
}

export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  const ext = path.extname(filename).toLowerCase();
  return allowedTypes.includes(ext);
}

export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}
