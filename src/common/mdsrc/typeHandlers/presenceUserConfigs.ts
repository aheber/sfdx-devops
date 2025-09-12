/* eslint-disable unicorn/filename-case */
import TypeDiffXml from './type-diff-xml.js';
import { XmlBody } from './type-metadata-base.js';

type PresenceUserConfig = {
  PresenceUserConfig: {
    assignments?: unknown[];
  };
} & XmlBody;

export default class PresenceUserConfigDiff extends TypeDiffXml {
  public async compare(p1: string, content1: string, p2: string, content2: string): Promise<boolean> {
    const xmls = await this.loadXMLData<PresenceUserConfig>(content1, content2);
    xmls[0].PresenceUserConfig.assignments = undefined;
    xmls[1].PresenceUserConfig.assignments = undefined;
    return this.isEqual(xmls[0], xmls[1]);
  }
}
