import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { TestInfo } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Utils {
  private static _generatedFilePath: string | null = null;
  public static get generatedFilePath(): string {
    if (!this._generatedFilePath) {
      throw new Error('Test file has not been generated yet.');
    }
    return this._generatedFilePath;
  }

  public static async generateTestFile(testInfo: TestInfo): Promise<void> {
    const testTitle = testInfo.title;
    const timestamp = Date.now();
    const safeTestName = `${testTitle.replace(/[^a-z0-9]/gi, '_')}_${timestamp}`;
    const tempDir = path.resolve(__dirname, '../temp_files');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    } else {
      this.cleanupOldFiles(tempDir);
    }
    const filePath = path.join(tempDir, `${safeTestName}.txt`);

    try {
      fs.writeFileSync(filePath, `File generated for test: ${testTitle} at ${new Date().toISOString()}`);
      this._generatedFilePath = filePath;
      console.log(`--- File generated: ${this._generatedFilePath} ---`);
    } catch (err) {
      console.error(`Failed to write test file: ${err}`);
      throw err;
    }
  }

  private static cleanupOldFiles(directory: string): void {
    const now = Date.now();
    const ONE_HOUR_MS = 60 * 60 * 1000;

    const files = fs.readdirSync(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      try {
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > ONE_HOUR_MS) {
          fs.unlinkSync(filePath);
          console.log(`--- Deleted old temp file: ${file} ---`);
        }
      } catch (err) {
        console.warn(`Could not process or delete file ${file}:`, err);
      }
    }
  }
}
