import * as eol from "eol";
import * as fs from "fs-extra";

export default class TypeDiffBase {
  public async compare(p1, p2): Promise<boolean> {
    const datas = await this.loadData(p1, p2);
    return datas[0] === datas[1];
  }

  public loadData(p1, p2): Promise<string[]> {
    return Promise.all([fs.readFile(p1), fs.readFile(p2)]).then(datas => {
      return datas.map(d => {
        return eol.lf(d.toString("utf8"));
      });
    });
  }

  public removeWhiteSpace(s) {
    return s.replace(
      /  +|[\f\t\v\r\n\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g,
      "",
    );
  }
}
