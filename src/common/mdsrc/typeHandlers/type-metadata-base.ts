/* eslint-disable guard-for-in */
import { Builder } from "xml2js";
import TypeDiffXml from "./type-diff-xml";
import { detailedDiff } from "deep-object-diff";

export default abstract class MetadataDiff extends TypeDiffXml {
  abstract getCoreObjectName(): string;

  protected getSubComponentNameKey(): string | { [key: string]: string } {
    return "fullName";
  }

  public async compare(p1, p2) {
    // console.log("Comparing objects", p1, p2);
    const changes = await this.getChanges(p1, p2);
    return Object.keys(changes[this.getCoreObjectName()]).length === 0;
  }

  public async buildOutput(p1, p2) {
    // console.log("Building Output for objects", p1, p2);
    const changes = await this.getChanges(p1, p2);
    const builder = new Builder({
      xmldec: { version: "1.0", encoding: "UTF-8" },
    });
    return builder.buildObject(changes);
  }

  protected async getChanges(p1, p2) {
    const xmls = await this.loadXMLData(p1, p2);
    // const changes = {} as any;
    // part out into core properties and sub-objects, handle special-case sub-objects
    const pieces1 = this.breakObjectIntoParts(xmls[0]);
    const pieces2 = this.breakObjectIntoParts(xmls[1]);
    const changes = this.getDifferences(pieces1.components, pieces2.components);

    if (
      Object.keys(changes[this.getCoreObjectName()]).length > 0 ||
      this.wouldChangeOrg(pieces1.core, pieces2.core)
    ) {
      changes[this.getCoreObjectName()] = Object.assign(
        changes[this.getCoreObjectName()],
        pieces1.core
      );
    }
    // for each subobject, identify any changes
    // for the core properties, determine if there are any changes
    return changes;
  }

  protected breakObjectIntoParts(xml) {
    const data = {
      core: {} as { [key: string]: any },
      components: {} as { [key: string]: any },
    };
    // look through each key inside the core object
    // console.log(xml);
    // eslint-disable-next-line guard-for-in
    for (const k in xml[this.getCoreObjectName()]) {
      const subset = xml[this.getCoreObjectName()][k];
      const names = this.getSubComponentNameKey();
      let typeName;
      if (typeof names === "object" && names[k] !== undefined) {
        typeName = names[k];
      } else {
        typeName = names as string;
      }
      // If the nested object contains a fullName attribute
      if (
        typeName !== undefined &&
        typeof subset[0] === "object" &&
        subset[0][typeName]
      ) {
        const d = {};
        // eslint-disable-next-line guard-for-in
        for (const m of subset) {
          d[m[typeName]] = m;
        }
        data.components[k] = d;
        // console.log("k", k);
      } else {
        data.core[k] = subset;
      }
    }
    // if it has any of the key names then break it out into a separate object by that key name
    // return all of the parts
    return data;
  }

  protected wouldChangeOrg(o1, o2) {
    const diff = detailedDiff(o1, o2) as any;
    if (
      Object.keys(diff.deleted).length > 0 ||
      Object.keys(diff.updated).length > 0
    ) {
      return true;
    }
    return false;
  }

  protected getDifferences(l1, l2): any {
    const changes = {};
    for (const k in l1) {
      if (k === "Core") {
        continue;
      }
      const p1 = l1[k];
      const p2 = l2[k];
      if (p2 === undefined) {
        // bring them all
        changes[k] = [];
        for (const n in p1) {
          changes[k].push(p1[n]);
        }
      } else {
        for (const n in p1) {
          if (p2[n] === undefined || this.isEqual(p1[n], p2[n]) === false) {
            // eslint-disable-next-line max-depth
            if (changes[k] === undefined) {
              changes[k] = [];
            }
            changes[k].push(p1[n]);
          }
        }
      }
    }
    const output = {};
    output[this.getCoreObjectName()] = changes;
    return output;
  }
}
