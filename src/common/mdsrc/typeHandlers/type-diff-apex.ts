import TypeDiffXml from './type-diff-xml.js';

export default class TypeDiffApex extends TypeDiffXml {
  protected BASE_KEY = 'SHOULDBEOVERRIDDDEN';

  public async compare(p1: string, content1: string, p2: string, content2: string): Promise<boolean> {
    const datas = p1.endsWith('.xml')
      ? (await this.loadXMLData(content1, content2)).map((d) => {
          const baseNode = d[this.BASE_KEY];
          if (baseNode.$?.fqn) {
            delete baseNode.$.fqn;
          }
          return d;
        })
      : [content1, content2].map((a) => this.removeWhiteSpace(a));
    return this.isEqual(datas[0], datas[1]);
  }
}
