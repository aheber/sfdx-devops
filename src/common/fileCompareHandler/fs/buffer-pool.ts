/**
 * Collection of buffers to be shared between async processes.
 * Avoids allocating buffers each time async process starts.
 * @param {number} bufSize - size of each buffer
 * @param {number} bufNo - number of buffers
 * @returns {any} - a buffer
 * Caller has to make sure no more than bufNo async processes run simultaneously.
 */
export function BufferPool(bufSize, bufNo): any {
  const bufferPool = [];

  function alloc(bufSize) {
    if (Buffer.alloc) {
      return Buffer.alloc(bufSize);
    }
    return Buffer.from(bufSize);
  }

  for (let i = 0; i < bufNo; i++) {
    bufferPool.push({
      buf1: alloc(bufSize),
      buf2: alloc(bufSize),
      busy: false
    });
  }

  const allocateBuffers = function() {
    for (let j = 0; j < bufNo; j++) {
      const bufferPair = bufferPool[j];
      if (!bufferPair.busy) {
        bufferPair.busy = true;
        return bufferPair;
      }
    }
    throw new Error("Async buffer limit reached");
  };

  function freeBuffers(bufferPair) {
    bufferPair.busy = false;
  }

  return {
    allocateBuffers: allocateBuffers,
    freeBuffers: freeBuffers
  };
}
