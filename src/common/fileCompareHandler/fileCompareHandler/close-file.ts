import fs from 'node:fs';
import type { FileDescriptorQueue } from '../fs/file-descriptor-queue.js';

export function closeFilesSync(fd1: number, fd2: number): void {
  if (fd1) {
    fs.closeSync(fd1);
  }

  if (fd2) {
    fs.closeSync(fd2);
  }
}

export async function closeFilesAsync(fd1: number, fd2: number, fdQueue: FileDescriptorQueue): Promise<void> {
  if (fd1) {
    await fdQueue.promises.close(fd1);
  }

  if (fd2) {
    await fdQueue.promises.close(fd2);
  }
}
