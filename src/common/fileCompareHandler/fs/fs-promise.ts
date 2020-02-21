const fs = require("fs");

export default {
  readdir: function(path) {
    return new Promise(function(resolve, reject) {
      fs.readdir(path, function(err, files) {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  },
  // eslint-disable-next-line max-params
  read: function(fd, buffer, offset, length, position) {
    return new Promise(function(resolve, reject) {
      fs.read(fd, buffer, offset, length, position, function(err, bytesRead) {
        if (err) {
          reject(err);
        } else {
          resolve(bytesRead);
        }
      });
    });
  }
};
