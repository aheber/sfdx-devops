/* eslint-disable class-methods-use-this */
import { parseStringPromise } from 'xml2js';

import MetadataDiff from './type-metadata-base.js';

export default class extends MetadataDiff {
  public async addFiles(filepath: string, fileContent: string): Promise<Array<{ content: string; path: string }>> {
    if (!(await this.isFlowObsolete(fileContent))) {
      return [];
    }

    return [
      {
        content: `<?xml version="1.0" encoding="UTF-8"?>
<FlowDefinition xmlns="http://soap.sforce.com/2006/04/metadata">
    <activeVersionNumber>0</activeVersionNumber>
</FlowDefinition>`,
        path: `flowDefinitions/${this.getFlowName(filepath)}.flowDefinition`,
      },
    ];
  }

  public async addToPackageXml(filepath: string, fileContent: string): Promise<{ FlowDefinition?: string[] }> {
    if (!(await this.isFlowObsolete(fileContent))) {
      return {};
    }

    // if flow is obsolete, add FlowDefinition to deactivate it
    return { FlowDefinition: [this.getFlowName(filepath)] };
  }

  public getCoreObjectName(): string {
    return 'Flow';
  }

  public getFlowName(filepath: string): string {
    return filepath.replace(/.*\/([^/]+).flow/, '$1');
  }

  public async isFlowObsolete(contents: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const xmlData = await parseStringPromise(contents);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return xmlData.Flow.status[0] === 'Obsolete';
  }
}
