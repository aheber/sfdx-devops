import { Builder } from "xml2js";
import TypeDiffXml from "./type-diff-xml";

export default class LabelDiff extends TypeDiffXml {
  public async compare(p1, p2) {
    const changes = await this.getChanges(p1, p2);
    return changes.length === 0;
  }

  public async buildOutput(p1, p2) {
    const changes = await this.getChanges(p1, p2);
    const labelXML = {
      CustomLabels: {
        $: {
          xmlns: "http://soap.sforce.com/2006/04/metadata"
        },
        labels: changes
      }
    };
    const builder = new Builder({
      xmldec: { version: "1.0", encoding: "UTF-8" }
    });
    return builder.buildObject(labelXML);
  }

  public async getChanges(p1, p2) {
    const xmls = await this.loadXMLData(p1, p2);
    // console.log(JSON.stringify(xmls, null, 2));
    const srcLabels = this.getLabelsObject(xmls[0].CustomLabels.labels);
    const orgLabels = this.getLabelsObject(xmls[1].CustomLabels.labels);
    // get added and changed labels

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

  private getLabelsObject(labels) {
    const srcLabels = {};
    labels.forEach(l => {
      srcLabels[l.fullName[0]] = l;
    });
    return srcLabels;
  }
}
