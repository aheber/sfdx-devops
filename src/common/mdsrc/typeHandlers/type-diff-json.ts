import TypeBase from "./type-diff-base";

export default class extends TypeBase {
  public async compare(p1, p2) {
    const jsons = await this.loadData(p1, p2);
    try {
      return this.isEqual(JSON.parse(jsons[0]), JSON.parse(jsons[1]));
    } catch (error) {}

    // parsing JSON failed, just execute diff as string
    return this.isEqual(jsons[0], jsons[1]);
  }

  // https://stackoverflow.com/a/60729670
  public isEqual(obj1, obj2): boolean {
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);

    if (obj1Keys.length !== obj2Keys.length) {
      return false;
    }

    for (const objKey of obj1Keys) {
      if (obj1[objKey] !== obj2[objKey]) {
        if (
          typeof obj1[objKey] === "object" &&
          typeof obj2[objKey] === "object"
        ) {
          if (!this.isEqual(obj1[objKey], obj2[objKey])) {
            return false;
          }
        } else {
          return false;
        }
      }
    }

    return true;
  }
}
