/* eslint-disable guard-for-in */
import { detailedDiff } from 'deep-object-diff';
import { Builder } from 'xml2js';

import TypeDiffXml from './type-diff-xml.js';

export type XmlBody = Record<string, XmlNode>;

export type XmlNode = {
  [key in string]: Array<XmlNode | string>;
} & {
  $?: Record<string, string>;
};

type ObjectParts = {
  core: XmlNode;
  components: Record<string, Record<string, XmlNode>>;
};

export abstract class MetadataDiffCore extends TypeDiffXml {
  public async compare(p1: string, incomingContent: string, p2: string, existingContent: string): Promise<boolean> {
    // console.log("Comparing objects", p1, p2);
    const changes = await this.getChanges(incomingContent, existingContent);
    return Object.keys(changes[this.getCoreObjectName()]).length === 0;
  }

  public async getChanges(incomingContent: string, existingContent: string): Promise<XmlBody> {
    const xmls = await this.loadXMLData<XmlBody>(incomingContent, existingContent);
    // const changes = {} as any;
    // part out into core properties and sub-objects, handle special-case sub-objects
    const pieces1 = this.breakObjectIntoParts(xmls[0]);
    const pieces2 = this.breakObjectIntoParts(xmls[1]);
    const changes = this.getDifferences(pieces1.components, pieces2.components);

    if (Object.keys(changes[this.getCoreObjectName()]).length > 0 || this.wouldChangeOrg(pieces1.core, pieces2.core)) {
      changes[this.getCoreObjectName()] = Object.assign(changes[this.getCoreObjectName()], pieces1.core);
    }
    // for each subobject, identify any changes
    // for the core properties, determine if there are any changes
    return changes;
  }
  protected breakObjectIntoParts(xml: XmlBody): ObjectParts {
    const data: ObjectParts = {
      core: {},
      components: {},
    };
    // look through each key inside the core object
    // console.log(xml);
    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    const coreObject = xml[this.getCoreObjectName()];
    for (const k in coreObject) {
      const subset = coreObject[k];
      const names = this.getSubComponentNameKey();
      let typeNameField;
      if (typeof names === 'object' && names[k] !== undefined) {
        typeNameField = names[k];
      } else {
        typeNameField = names as string;
      }
      // If the nested object contains a fullName attribute
      if (typeNameField !== undefined && typeof subset[0] === 'object' && subset[0]?.[typeNameField]) {
        const d: Record<string, XmlNode> = {};
        for (const m of subset as XmlNode[]) {
          const key = m[typeNameField][0] as string;
          d[key] = m;
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

  protected getDifferences(
    l1: Record<string, Record<string, XmlNode>>,
    l2: Record<string, Record<string, XmlNode>>
  ): XmlBody {
    const changes: Record<string, XmlNode[]> = {};
    for (const k in l1) {
      if (k === 'Core') {
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
    return { [this.getCoreObjectName()]: changes };
  }

  // eslint-disable-next-line class-methods-use-this
  protected getSubComponentNameKey(): string | Record<string, string> {
    return 'fullName';
  }

  // eslint-disable-next-line class-methods-use-this
  protected wouldChangeOrg(o1: object, o2: object): boolean {
    const diff = detailedDiff(o1, o2);
    if (Object.keys(diff.deleted).length > 0 || Object.keys(diff.updated).length > 0) {
      return true;
    }
    return false;
  }
  public abstract getCoreObjectName(): string;
}

export default abstract class MetadataDiff extends MetadataDiffCore {
  public async buildOutput(incomingContent: string, existingContent: string): Promise<string> {
    // console.log("Building Output for objects", p1, p2);
    const changes = await this.getChanges(incomingContent, existingContent);
    const builder = new Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    });
    return builder.buildObject(changes);
  }
}
