import {Builder} from "xml2js";
import TypeDiffXml from "./type-diff-xml";

export default class TypeDiffMetadata extends TypeDiffXml {
  public async compare(p1, p2) {
    const changes = await this.getChanges(p1, p2);
    return changes.length === 0;
  }

  public async buildOutput1(p1, p2) {
    const changes = await this.getChanges(p1, p2);
    const labelXML = {
      CustomLabels: {
        $: {
          xmlns: "http://soap.sforce.com/2006/04/metadata",
        },
        labels: changes,
      },
    };
    const builder = new Builder({
      xmldec: {version: "1.0", encoding: "UTF-8"},
    });
    return builder.buildObject(labelXML);
  }

  public async getChanges(p1, p2) {
    const xmls = await this.loadXMLData(p1, p2);
    console.log("XML", JSON.stringify(xmls[0], null, 2));
    const srcLabels = this.getLabelsObject(xmls[0].CustomLabels.labels);
    const orgLabels = this.getLabelsObject(xmls[1].CustomLabels.labels);
    // console.log(JSON.stringify(xmls[0], null, 2));
    // get added and changed labels
    const srcObj = this.buildUpKeys(xmls[0]);
    console.log("srcObj Obj", JSON.stringify(srcObj, null, 2));
    const orgObj = this.buildUpKeys(xmls[1]);
    const delta = this.compareObjectTrees(srcObj, orgObj);
    console.log("Delta Obj", JSON.stringify(delta, null, 2));
    return Object.keys(srcLabels)
    .filter(l => {
      // Key is unique to src
      if (orgLabels[l] === undefined) {
        return true;
      }
      // Compare labels
      return !this.isEqual(orgLabels[l], srcLabels[l]);
    })
    .map(l => srcLabels[l]);
  }

  private buildUpKeys(obj) {
    if (obj.fullName !== undefined) {
      return obj;
    }
    Object.keys(obj).forEach(j => {
      if (Array.isArray(obj[j])) {
        const newObj = {};
        obj[j].forEach(k => {
          newObj[k.fullName] = k;
        });
        obj[j] = newObj;
      }
      if (this.isObject(obj)) {
        obj[j] = this.buildUpKeys(obj[j]);
      }
    });
    return obj;
  }

  private isObject(obj) {
    return typeof obj === "object" && obj !== null;
  }

  private getLabelsObject(labels) {
    const srcLabels = {};
    labels.forEach(l => {
      srcLabels[l.fullName[0]] = l;
    });
    return srcLabels;
  }

  private compareObjectTrees(obj1, obj2) {
    if (!this.isObject(obj1) || obj1.fullName !== undefined) {
      return obj1;
    }
    const ret = {};
    // for each level
    Object.keys(obj1).forEach(j => {
      if (obj2[j] === undefined) {
        ret[j] = obj1[j];
      } else if (!this.isEqual(obj1[j], obj2[j])) {
        ret[j] = this.compareObjectTrees(obj1[j], obj2[j]);
      }
    });
    return ret;
  }
}
