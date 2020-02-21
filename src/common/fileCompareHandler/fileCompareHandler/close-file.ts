const fs = require("fs");

export function closeFilesSync(fd1, fd2) {
  if (fd1) {
    fs.closeSync(fd1);
  }
  if (fd2) {
    fs.closeSync(fd2);
  }
}

export function closeFilesAsync(fd1, fd2, fdQueue) {
  if (fd1 && fd2) {
    return fdQueue.promises.close(fd1).then(() => fdQueue.promises.close(fd2));
  }
  if (fd1) {
    return fdQueue.promises.close(fd1);
  }
  if (fd2) {
    return fdQueue.promises.close(fd2);
  }
}
