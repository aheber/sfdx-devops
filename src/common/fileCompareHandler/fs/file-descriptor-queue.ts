'use strict';

import * as fs from 'node:fs';

import { Queue } from './queue.js';
/**
 * Limits the number of concurrent file handlers.
 * Use it as a wrapper over fs.open() and fs.close().
 * Example:
 * var fdQueue = new FileDescriptorQueue(8)
 * fdQueue.open(path, flags, (err, fd) =>{
 * ...
 * fdQueue.close(fd, (err) =>{
 * ...
 * })
 * })
 * As of node v7, calling fd.close without a callback is deprecated.
 *
 * @param {number} maxFilesNo hwo many concurrent file handlers should be created
 * @returns {any} returns a File Descriptor Queue
 */
export class FileDescriptorQueue {
  public promises;
  private maxFilesNo;
  private activeCount = 0;
  private pendingJobs;

  public constructor(maxFilesNo: number) {
    this.maxFilesNo = maxFilesNo;
    this.pendingJobs = new Queue<{
      callback: (err: NodeJS.ErrnoException | null, fd: number) => void;
      flags: fs.OpenMode | undefined;
      path: fs.PathLike;
    }>();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;

    this.promises = {
      close(fd: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          that.close(fd, (err) => {
            if (err) {
              reject(err);
            }
            resolve();
          });
        });
      },

      open(path: string, flags: fs.OpenMode | undefined): Promise<number> {
        return new Promise((resolve, reject) => {
          that.open(path, flags, (err, fd) => {
            if (err) {
              reject(err);
            } else {
              resolve(fd);
            }
          });
        });
      },
    };
  }
  public process(): void {
    if (this.pendingJobs.getLength() > 0 && this.activeCount < this.maxFilesNo) {
      const job = this.pendingJobs.dequeue();
      this.activeCount++;
      if (job == null) {
        throw new Error('No job available to process');
      }
      fs.open(job.path, job.flags, job.callback);
    }
  }

  public open(
    path: string,
    flags: fs.OpenMode | undefined,
    callback: (err: NodeJS.ErrnoException | null, fd: number) => void
  ): void {
    this.pendingJobs.enqueue({
      callback,
      flags,
      path,
    });
    this.process();
  }

  public close(fd: number, callback: fs.NoParamCallback): void {
    this.activeCount--;
    fs.close(fd, callback);
    this.process();
  }
}
