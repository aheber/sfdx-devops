import TypeBase from './type-diff-base.js';

export default class extends TypeBase {
  // eslint-disable-next-line @typescript-eslint/require-await
  public async compare(p1: string, content1: string, p2: string, content2: string): Promise<boolean> {
    try {
      return this.isEqual(
        JSON.parse(content1) as Record<string, unknown>,
        JSON.parse(content2) as Record<string, unknown>
      );
    } catch {
      // parsing JSON failed, just execute diff as string
      return this.isEqual(content1, content2);
    }
  }

  // https://stackoverflow.com/a/60729670
  public isEqual(obj1: unknown, obj2: unknown): boolean {
    if (typeof obj1 === 'string' || typeof obj2 === 'string') {
      if (obj1 === obj2) {
        return true;
      }
      return false;
    }
    if (obj1 === null || obj2 === null) {
      if (obj1 === obj2) {
        return true;
      }
      return false;
    }
    if (obj1 === undefined || obj2 === undefined) {
      if (obj1 === obj2) {
        return true;
      }
      return false;
    }
    const obj1Keys = Object.keys(obj1) as Array<keyof typeof obj1>;

    if (obj1Keys.length !== Object.keys(obj2).length) {
      return false;
    }

    for (const objKey of obj1Keys) {
      const value1 = obj1[objKey] as unknown;
      const value2 = obj2[objKey] as unknown;
      if (value1 !== value2) {
        if (typeof value1 === 'object' && typeof value2 === 'object') {
          if (!this.isEqual(value1, value2)) {
            return false;
          }
        } else {
          return false;
        }
      }
    }

    return true;
  }
}
