import fs from 'node:fs';

export default {
  // eslint-disable-next-line max-params
  read(fd: number, buffer: Buffer, offset: number, length: number, position: number | null): Promise<number> {
    return new Promise((resolve, reject) => {
      fs.read(fd, buffer, offset, length, position, (err, bytesRead) => {
        if (err) {
          reject(err);
        } else {
          resolve(bytesRead);
        }
      });
    });
  },
  readdir(path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  },
};
