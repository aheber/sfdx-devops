import TypeDiffXml from "./typeHandlers/type-diff-xml";
import { closeFilesAsync } from "dir-compare/src/fileCompareHandler/closeFile";
import * as buffPool from "dir-compare/src/fs/BufferPool";
import * as fileDescriptorQueue from "dir-compare/src/fs/fileDescriptorQueue";
import * as fsPromise from "dir-compare/src/fs/fsPromise";
import { getMetadataInfo } from "./metadata-info";

const MAX_CONCURRENT_FILE_COMPARE = 1;
const BUF_SIZE = 100000;
const fdQueue = fileDescriptorQueue(MAX_CONCURRENT_FILE_COMPARE * 2);

const bufferPool = buffPool(BUF_SIZE, MAX_CONCURRENT_FILE_COMPARE); // fdQueue guarantees there will be no more than MAX_CONCURRENT_FILE_COMPARE async processes accessing the buffers concurrently

let metadataInfo;

// Compares two files by content
// eslint-disable-next-line max-params
export async function compareAsync(p1, stat1, p2, stat2, options) {
  let fd1;
  let fd2;
  let bufferPair;

  if (!metadataInfo) {
    await getMetadataInfo().then(res => {
      metadataInfo = res;
    });
  }

  const getMetadataFolder = (p1, folder1) => {
    // determine metadata type by folder
    // naieve normalize file separators
    const path1 = p1.replace(/[\\/]/g, "/");
    const part1 = folder1.replace(/[\\/]/g, "/").replace(/^\./, "");
    const relativePath = path1.substring(
      path1.indexOf(part1) + part1.length,
      999
    );
    return relativePath.split("/")[1];
  };

  // remove white spaces except line endings
  const removeWhiteSpace = s => {
    return s.replace(
      /  +|[\f\t\v\r\n\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g,
      ""
    );
  };

  const endsWithAny = (s, suffixes) => {
    return suffixes.some(suffix => {
      return s.endsWith(suffix);
    });
  };

  const metadataFolder = getMetadataFolder(p1, options.paths[0]);

  // try to load a type-specific handler once, if it fails it will be stamped as "false"
  // if (perTypeHandlers[metadataFolder] === undefined) {
  //   try {
  //     perTypeHandlers[metadataFolder] = await import(
  //       `./typeHandlers/${metadataFolder}`
  //     ).then(l => {
  //       return new l.default();
  //     });
  //   } catch (err) {
  //     perTypeHandlers[metadataFolder] = false;
  //   }
  // }

  // If we have a type-specific handler available, use it to compare
  //   console.log(metadataFolder, metadataInfo[metadataFolder]);
  if (metadataInfo[metadataFolder].mdtHandler !== undefined) {
    return metadataInfo[metadataFolder].mdtHandler.compare(p1, p2);
  }
  // Smart-compare XML files instead of byte-compare
  // Helps with attribute ordering other small changes
  if (endsWithAny(p1, [".xml"])) {
    return new TypeDiffXml().compare(p1, p2);
  }

  // Finally give up and perform generally optimized string comparisons
  // TODO: optimize this to correctly manage binary files again where appropriate
  return Promise.all([
    fdQueue.promises.open(p1, "r"),
    fdQueue.promises.open(p2, "r")
  ])
    .then(fds => {
      bufferPair = bufferPool.allocateBuffers();
      fd1 = fds[0];
      fd2 = fds[1];
      const buf1 = bufferPair.buf1;
      const buf2 = bufferPair.buf2;
      const compareAsyncInternal = () => {
        return Promise.all([
          fsPromise.read(fd1, buf1, 0, BUF_SIZE, null),
          fsPromise.read(fd2, buf2, 0, BUF_SIZE, null)
        ]).then(bufferSizes => {
          const size1 = bufferSizes[0];
          const size2 = bufferSizes[1];
          // running the risk of clearing whitespace causing different byte read sequence
          // TODO: need to carry a partial forward to subsequent reads
          const chunk1 = removeWhiteSpace(buf1.toString("utf8", 0, size1));
          const chunk2 = removeWhiteSpace(buf2.toString("utf8", 0, size2));
          if (size1 === 0 && size2 === 0) {
            return true;
          }
          if (chunk1 !== chunk2) {
            return false;
          }
          return compareAsyncInternal();
        });
      };
      return compareAsyncInternal();
    })
    .finally(() => {
      closeFilesAsync(fd1, fd2, fdQueue);
      bufferPool.freeBuffers(bufferPair);
    });
}
