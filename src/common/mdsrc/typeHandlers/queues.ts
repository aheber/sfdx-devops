import TypeDiffXml from './type-diff-xml.js';
import { XmlBody } from './type-metadata-base.js';

type Queue = {
  Queue: {
    queueMembers?: unknown[];
  };
} & XmlBody;

export default class QueueDiff extends TypeDiffXml {
  public async compare(p1: string, content1: string, p2: string, content2: string): Promise<boolean> {
    const xmls = await this.loadXMLData<Queue>(content1, content2);
    xmls[0].Queue.queueMembers = undefined;
    xmls[1].Queue.queueMembers = undefined;
    return this.isEqual(xmls[0], xmls[1]);
  }
}
