/* eslint-disable unicorn/filename-case */
import TypeDiffXml from "./type-diff-xml";

export default class PresenceUserConfigDiff extends TypeDiffXml {
  public async compare(p1, p2) {
    const xmls = await this.loadXMLData(p1, p2);
    xmls[0].PresenceUserConfig.assignments = undefined;
    xmls[1].PresenceUserConfig.assignments = undefined;
    return this.isEqual(xmls[0], xmls[1]);
  }
}
