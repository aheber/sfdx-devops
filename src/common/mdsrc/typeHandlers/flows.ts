/* eslint-disable unicorn/filename-case */
import MetadataDiff from "./type-metadata-base";
import * as fs from "fs-extra";
import { parseStringPromise } from "xml2js";

export default class extends MetadataDiff {
  getCoreObjectName() {
    return "Flow";
  }

  getFlowName(filepath) {
    return filepath.replace(/.*\/([^/]+).flow/, "$1");
  }

  async isFlowObsolete(filepath) {
    const flowData = fs.readFileSync(filepath).toString("utf8");
    const xmlData = await parseStringPromise(flowData);
    return xmlData.Flow.status[0] === "Obsolete";
  }

  async addToPackageXml(filepath) {
    if (!(await this.isFlowObsolete(filepath))) {
      return {};
    }
    // if flow is obsolete, add FlowDefinition to deactivate it
    return { FlowDefinition: [this.getFlowName(filepath)] };
  }

  async addFiles(filepath) {
    if (!(await this.isFlowObsolete(filepath))) {
      return [];
    }
    return [
      {
        path: `flowDefinitions/${this.getFlowName(filepath)}.flowDefinition`,
        content: `<?xml version="1.0" encoding="UTF-8"?>
<FlowDefinition xmlns="http://soap.sforce.com/2006/04/metadata">
    <activeVersionNumber>0</activeVersionNumber>
</FlowDefinition>`,
      },
    ];
  }
}
