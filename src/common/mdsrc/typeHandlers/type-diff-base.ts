/* eslint-disable class-methods-use-this */
// import { readFile } from 'node:fs/promises';

export default class TypeDiffBase {
  // eslint-disable-next-line @typescript-eslint/require-await
  public async compare(p1: string, content1: string, p2: string, content2: string): Promise<boolean> {
    return content1 === content2;
  }

  public removeWhiteSpace(s: string): string {
    return s.replaceAll(/  +|[\t\n\v\f\r\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]+/g, '');
  }

  public addToPackageXml?(filepath: string, fileContent: string): Promise<Record<string, string[]>>;

  public async addFiles?(filepath: string, fileContent: string): Promise<Array<{ content: string; path: string }>>;

  public async buildOutput?(incomingContent: string, existingContent: string): Promise<string>;
}
