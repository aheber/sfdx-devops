export type BufferPair = { buf1: Buffer; buf2: Buffer; busy: boolean };

/**
 * Collection of buffers to be shared between async processes.
 * Avoids allocating buffers each time async process starts.
 * Caller has to make sure no more than bufNo async processes run simultaneously.
 */
export class BufferPool {
  private bufferPool: BufferPair[] = [];

  public constructor(bufSize: number, bufNo: number) {
    for (let i = 0; i < bufNo; i++) {
      this.bufferPool.push({
        buf1: Buffer.alloc(bufSize),
        buf2: Buffer.alloc(bufSize),
        busy: false,
      });
    }
  }

  public allocateBuffers(): BufferPair {
    for (const bufferPair of this.bufferPool) {
      if (!bufferPair.busy) {
        bufferPair.busy = true;
        return bufferPair;
      }
    }

    throw new Error('Async buffer limit reached');
  }

  // eslint-disable-next-line class-methods-use-this
  public freeBuffers(bufferPair: BufferPair): void {
    // eslint-disable-next-line no-param-reassign
    bufferPair.busy = false;
  }
}
