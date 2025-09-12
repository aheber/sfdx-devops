// import * as deepEqual from 'deep-equal';
import { deepEqual } from 'node:assert';
import { Parser } from 'xml2js';

import TypeBase from './type-diff-base.js';
import { XmlBody } from './type-metadata-base.js';

export default class TypeDiffXml extends TypeBase {
  public async compare(p1: string, content1: string, p2: string, content2: string): Promise<boolean> {
    const xmls = await this.loadXMLData(content1, content2);
    return this.isEqual(xmls[0], xmls[1]);
  }

  // eslint-disable-next-line class-methods-use-this
  public isEqual<T>(xml1: T, xml2: T): boolean {
    try {
      deepEqual(xml1, xml2);
      return true;
    } catch (err) {
      // noop
    }
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  public async loadXMLData<T extends XmlBody>(incomingContent: string, existingContent: string): Promise<T[]> {
    const parser = new Parser();
    let out;
    try {
      out = (await Promise.all([
        parser.parseStringPromise(incomingContent),
        parser.parseStringPromise(existingContent),
      ])) as T[];
    } catch {
      throw new Error('Error parsing XML');
    }

    return out;
  }
}
