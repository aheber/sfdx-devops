import type { Stats } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { closeFilesAsync } from '../fileCompareHandler/fileCompareHandler/close-file.js';
import { BufferPair, BufferPool } from '../fileCompareHandler/fs/buffer-pool.js';
import { FileDescriptorQueue } from '../fileCompareHandler/fs/file-descriptor-queue.js';
import { default as fsPromise } from '../fileCompareHandler/fs/fs-promise.js';
import { getMetadataInfo, TypeDef } from './metadata-info.js';
import TypeDiffJson from './typeHandlers/type-diff-json.js';
import TypeDiffXml from './typeHandlers/type-diff-xml.js';

const MAX_CONCURRENT_FILE_COMPARE = 1;
const BUF_SIZE = 100_000;
const fdQueue = new FileDescriptorQueue(MAX_CONCURRENT_FILE_COMPARE * 2);

const bufferPool = new BufferPool(BUF_SIZE, MAX_CONCURRENT_FILE_COMPARE); // fdQueue guarantees there will be no more than MAX_CONCURRENT_FILE_COMPARE async processes accessing the buffers concurrently

let metadataInfo: Record<string, TypeDef>;

type CompareOptions = {
  paths: string[];
};

// Compares two files by content
// eslint-disable-next-line max-params
export async function compareAsync(
  p1: string,
  stat1: Stats,
  p2: string,
  stat2: Stats,
  options: CompareOptions
): Promise<boolean> {
  let fd1: number;
  let fd2: number;
  let bufferPair: BufferPair;

  if (!metadataInfo) {
    await getMetadataInfo().then((res) => {
      metadataInfo = res;
    });
  }

  const getMetadataFolder = (p1Inner: string, folder1: string): string => {
    // determine metadata type by folder
    // naieve normalize file separators
    const path1 = p1Inner.replaceAll(/[/\\]/g, '/');
    const part1 = folder1.replaceAll(/[/\\]/g, '/').replace(/^\./, '');
    const relativePath = path1.substring(path1.indexOf(part1) + part1.length, 999);
    return relativePath.split('/')[1];
  };

  // remove white spaces except line endings
  const removeWhiteSpace = (s: string): string =>
    s.replaceAll(/  +|[\t\n\v\f\r\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+/g, '');

  const metadataFolder = getMetadataFolder(p1, options.paths[0]);

  // If we have a type-specific handler available, use it to compare
  const handler = metadataInfo[metadataFolder]?.mdtHandler;
  if (handler?.compare !== undefined) {
    const datas = await Promise.all([readFile(p1, 'utf8'), readFile(p2, 'utf8')]);
    return handler.compare(p1, datas[0], p2, datas[1]);
  }

  function compareBuffers(buf1: Buffer, buf2: Buffer, contentSize: number): boolean {
    return buf1.slice(0, contentSize).equals(buf2.slice(0, contentSize));
  }

  // Finally give up and perform generally optimized string comparisons
  // TODO: optimize this to correctly manage binary files again where appropriate
  const match = await Promise.all([fdQueue.promises.open(p1, 'r'), fdQueue.promises.open(p2, 'r')])
    .then((fds) => {
      bufferPair = bufferPool.allocateBuffers();
      fd1 = fds[0];
      fd2 = fds[1];
      const { buf1 } = bufferPair;
      const { buf2 } = bufferPair;
      const compareAsyncInternal = (): Promise<boolean> =>
        Promise.all([fsPromise.read(fd1, buf1, 0, BUF_SIZE, null), fsPromise.read(fd2, buf2, 0, BUF_SIZE, null)]).then(
          (bufferSizes) => {
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
            const chunk1 = removeWhiteSpace(buf1.toString('utf8', 0, size1));
            const chunk2 = removeWhiteSpace(buf2.toString('utf8', 0, size2));
            if (chunk1 !== chunk2) {
              return false;
            }

            return compareAsyncInternal();
          }
        );

      return compareAsyncInternal();
    })
    .finally((): void => {
      closeFilesAsync(fd1, fd2, fdQueue).catch((err) => {
        throw err;
      });
      bufferPool.freeBuffers(bufferPair);
    });

  if (!match) {
    // Smart-compare XML files instead of byte-compare
    // Helps with attribute ordering other small changes
    if (p1.endsWith('.xml')) {
      return Promise.all([readFile(p1, 'utf8'), readFile(p2, 'utf8')]).then((datas) =>
        new TypeDiffXml().compare(p1, datas[0], p2, datas[1])
      );
    }

    if (p1.endsWith('.json')) {
      return Promise.all([readFile(p1, 'utf8'), readFile(p2, 'utf8')]).then((datas) =>
        new TypeDiffJson().compare(p1, datas[0], p2, datas[1])
      );
    }
  }

  return match;
}
