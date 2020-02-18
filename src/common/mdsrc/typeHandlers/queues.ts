import TypeDiffXml from "./type-diff-xml";

export default class QueueDiff extends TypeDiffXml {
  public async compare(p1, p2) {
    const xmls = await this.loadXMLData(p1, p2);
    xmls[0].Queue.queueMembers = undefined;
    xmls[1].Queue.queueMembers = undefined;
    return this.isEqual(xmls[0], xmls[1]);
  }
}
