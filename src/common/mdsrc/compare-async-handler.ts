import TypeDiffXml from "./typeHandlers/type-diff-xml";
import TypeDiffJson from "./typeHandlers/type-diff-json";
import { closeFilesAsync } from "../fileCompareHandler/fileCompareHandler/close-file";
import { BufferPool as buffPool } from "../fileCompareHandler/fs/buffer-pool";
import { FileDescriptorQueue as fileDescriptorQueue } from "../fileCompareHandler/fs/file-descriptor-queue";
import { default as fsPromise } from "../fileCompareHandler/fs/fs-promise";
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
    await getMetadataInfo().then((res) => {
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
  const removeWhiteSpace = (s) => {
    return s.replace(
      /  +|[\f\t\v\r\n\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g,
      ""
    );
  };

  const metadataFolder = getMetadataFolder(p1, options.paths[0]);

  // If we have a type-specific handler available, use it to compare
  if (
    metadataInfo[metadataFolder] &&
    metadataInfo[metadataFolder].mdtHandler !== undefined
  ) {
    return metadataInfo[metadataFolder].mdtHandler.compare(p1, p2);
  }

  function compareBuffers(
    buf1: Buffer,
    buf2: Buffer,
    contentSize: number
  ): boolean {
    return buf1.slice(0, contentSize).equals(buf2.slice(0, contentSize));
  }

  // Finally give up and perform generally optimized string comparisons
  // TODO: optimize this to correctly manage binary files again where appropriate
  const match = await Promise.all([
    fdQueue.promises.open(p1, "r"),
    fdQueue.promises.open(p2, "r"),
  ])
    .then((fds) => {
      bufferPair = bufferPool.allocateBuffers();
      fd1 = fds[0];
      fd2 = fds[1];
      const buf1 = bufferPair.buf1;
      const buf2 = bufferPair.buf2;
      const compareAsyncInternal = () => {
        return Promise.all([
          fsPromise.read(fd1, buf1, 0, BUF_SIZE, null) as Promise<number>,
          fsPromise.read(fd2, buf2, 0, BUF_SIZE, null) as Promise<number>,
        ]).then((bufferSizes) => {
          const size1 = bufferSizes[0];
          const size2 = bufferSizes[1];
          if (size1 === 0 && size2 === 0) {
            return true;
          }
          if (compareBuffers(buf1, buf2, size1)) {
            // content is the same, moving on
            return compareAsyncInternal();
          }
          // running the risk of clearing whitespace causing different byte read sequence
          // TODO: need to carry a partial forward to subsequent reads
          const chunk1 = removeWhiteSpace(buf1.toString("utf8", 0, size1));
          const chunk2 = removeWhiteSpace(buf2.toString("utf8", 0, size2));
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

  if (!match) {
    // Smart-compare XML files instead of byte-compare
    // Helps with attribute ordering other small changes
    if (p1.endsWith(".xml")) {
      return new TypeDiffXml().compare(p1, p2);
    }
    if (p1.endsWith(".json")) {
      return new TypeDiffJson().compare(p1, p2);
    }
  }
  return match;
}
