import * as deepEqual from "deep-equal";
import { Parser } from "xml2js";
import TypeBase from "./type-diff-base";

export default class TypeDiffXml extends TypeBase {
  public async compare(p1, p2) {
    const xmls = await this.loadXMLData(p1, p2);
    return this.isEqual(xmls[0], xmls[1]);
  }

  public isEqual(xml1, xml2): boolean {
    return deepEqual(xml1, xml2);
  }

  // tslint:disable-next-line:no-any
  public async loadXMLData(p1, p2): Promise<any> {
    const datas = await this.loadData(p1, p2);
    const parser = new Parser();
    let out;
    try {
      out = await Promise.all(datas.map(d => parser.parseStringPromise(d)));
    } catch (error) {
      console.error(error);
    }
    return out;
  }
}
