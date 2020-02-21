"use strict";

import * as fs from "fs";
import { Queue } from "./queue";
/**
 * Limits the number of concurrent file handlers.
 * Use it as a wrapper over fs.open() and fs.close().
 * Example:
 *  var fdQueue = new FileDescriptorQueue(8)
 *  fdQueue.open(path, flags, (err, fd) =>{
 *    ...
 *    fdQueue.close(fd, (err) =>{
 *      ...
 *    })
 *  })
 *  As of node v7, calling fd.close without a callback is deprecated.
 * @param {number} maxFilesNo hwo many concurrent file handlers should be created
 * @returns {any} returns a File Descriptor Queue
 */
export function FileDescriptorQueue(maxFilesNo) {
  const pendingJobs = new Queue();
  let activeCount = 0;

  const process = function() {
    if (pendingJobs.getLength() > 0 && activeCount < maxFilesNo) {
      const job = pendingJobs.dequeue();
      activeCount++;
      fs.open(job.path, job.flags, job.callback);
    }
  };

  const open = function(path, flags, callback) {
    pendingJobs.enqueue({
      path: path,
      flags: flags,
      callback: callback
    });
    process();
  };

  const close = function(fd, callback) {
    activeCount--;
    fs.close(fd, callback);
    process();
  };

  const promises = {
    open: function(path, flags) {
      return new Promise(function(resolve, reject) {
        open(path, flags, function(err, fd) {
          if (err) {
            reject(err);
          } else {
            resolve(fd);
          }
        });
      });
    },

    close: function(fd) {
      return new Promise(function(resolve, reject) {
        close(fd, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  };

  return {
    open: open,
    close: close,
    promises: promises
  };
}
