/* eslint-disable class-methods-use-this */
import MetadataDiff, { XmlBody } from './type-metadata-base.js';

type ObjectXmlInternal = {
  fields?: Array<{
    valueSet?: Array<{
      valueSetDefinition?: Array<{
        value: Array<{
          isActive: Array<'false' | 'true'>;
          fullName: string[];
        }>;
      }>;
    }>;
    formula: string[];
    description: string[];
  }>;
};

type ObjectXml = {
  CustomObject: ObjectXmlInternal;
} & XmlBody;

export default class CustomObjectDiff extends MetadataDiff {
  public cleanNewlineChars(textArray: string[]): string[] {
    if (!textArray) {
      return textArray;
    }

    // The org often adds/keeps spaces on ending newlines but SFDX Convert drops it while printing the XML
    // Deploying without the extra space doesn't get rid of it
    return textArray.map((t) => t.replaceAll(/ +\n/g, '\n').trim());
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public getCoreObjectName() {
    return 'CustomObject' as const;
  }

  // overridden from the parent so we can do some magic with sharing models
  public async getChanges(p1: string, p2: string): Promise<XmlBody> {
    const xmls = await this.loadXMLData<ObjectXml>(p1, p2);
    this.normalizeFieldNewLines(xmls[0]);
    this.normalizeFieldNewLines(xmls[1]);
    // remove inactive picklists from the target dataset
    this.stripInactivePicklistEntriesFromOrg(xmls);

    // const changes = {} as any;
    // part out into core properties and sub-objects, handle special-case sub-objects
    const pieces1 = super.breakObjectIntoParts(xmls[0]);
    const pieces2 = super.breakObjectIntoParts(xmls[1]);
    const changes = super.getDifferences(pieces1.components, pieces2.components);

    if (Object.keys(changes.CustomObject).length > 0 || this.wouldChangeOrg(pieces1.core, pieces2.core)) {
      const cbp = ['ControlledByParent'];
      // If either of the sharing models are set to ControlledByParent
      // Then we must include the MasterDetail fields in the change
      if (super.isEqual(pieces1.core.sharingModel, cbp) || super.isEqual(pieces1.core.externalSharingModel, cbp)) {
        if (!changes.CustomObject.fields) {
          changes.CustomObject.fields = [];
        }

        // Get any MasterDetail fields that aren't already identified as changes
        const mdtFields = Object.keys(pieces1.components.fields)
          .map((f) => pieces1.components.fields[f])
          // get only MasterDetail fields
          .filter((f) => super.isEqual(f.type, ['MasterDetail']))
          // get only those not already included in the change detection
          .filter((f) => !changes.CustomObject.fields.includes(f));
        // merge the new fields
        changes.CustomObject.fields.push(...mdtFields);
      }

      changes.CustomObject = Object.assign(changes.CustomObject, pieces1.core);
    }

    return changes;
  }

  private normalizeFieldNewLines(mdt: ObjectXml): void {
    if (mdt.CustomObject.fields) {
      for (const f of mdt.CustomObject.fields) {
        if (f.description) {
          f.description = this.cleanNewlineChars(f.description);
        }

        if (f.formula) {
          f.formula = this.cleanNewlineChars(f.formula);
        }
      }
    }
  }

  private stripInactivePicklistEntriesFromOrg(mdtList: ObjectXml[]): void {
    // collect the API names from the src list, cross-eliminate any inactive in the org list
    const inactiveSrcSet = new Set();
    if (mdtList[0].CustomObject.fields) {
      for (const f of mdtList[0].CustomObject.fields) {
        if (f.valueSet?.[0].valueSetDefinition) {
          for (const v of f.valueSet[0].valueSetDefinition[0].value) {
            if (v.isActive && v.isActive[0] === 'false') {
              inactiveSrcSet.add(v.fullName[0]);
            }
          }
        }
      }
    }

    if (mdtList[1].CustomObject.fields) {
      for (const f of mdtList[1].CustomObject.fields) {
        if (f.valueSet?.[0].valueSetDefinition) {
          f.valueSet[0].valueSetDefinition[0].value = f.valueSet[0].valueSetDefinition[0].value.filter((v) => {
            // if picklist value is inactive but wasn't found in the src list, filter it out
            if (v.isActive && v?.isActive[0] === 'false' && !inactiveSrcSet.has(v.fullName[0])) {
              return false;
            }

            return true;
          });
        }
      }
    }
  }
}
