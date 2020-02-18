import TypeDiffXml from "./type-diff-xml";

export default class TypeDiffApex extends TypeDiffXml {
  protected BASE_KEY = "SHOULDBEOVERRIDDDEN";

  public async compare(p1, p2) {
    let datas;
    if (p1.endsWith(".xml")) {
      datas = (await this.loadXMLData(p1, p2)).map(d => {
        d[this.BASE_KEY].$.fqn = undefined;
        return d;
      });
    } else {
      datas = (await this.loadData(p1, p2)).map(a => this.removeWhiteSpace(a));
    }
    return this.isEqual(datas[0], datas[1]);
  }
}
