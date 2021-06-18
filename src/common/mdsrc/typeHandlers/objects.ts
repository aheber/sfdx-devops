import MetadataDiff from "./type-metadata-base";

export default class CustomObjectDiff extends MetadataDiff {
  getCoreObjectName() {
    return "CustomObject";
  }

  // overridden from the parent so we can do some magic with sharing models
  protected async getChanges(p1, p2) {
    const xmls = await this.loadXMLData(p1, p2);
    this.normalizeFieldNewLines(xmls[0]);
    this.normalizeFieldNewLines(xmls[1]);
    // remove inactive picklists from the target dataset
    this.stripInactivePicklistEntries(xmls[1]);
    // const changes = {} as any;
    // part out into core properties and sub-objects, handle special-case sub-objects
    const pieces1 = super.breakObjectIntoParts(xmls[0]);
    const pieces2 = super.breakObjectIntoParts(xmls[1]);
    const changes = super.getDifferences(
      pieces1.components,
      pieces2.components
    );
    // console.log("Changes", JSON.stringify(changes, null, 2));

    if (
      Object.keys(changes.CustomObject).length > 0 ||
      this.wouldChangeOrg(pieces1.core, pieces2.core)
    ) {
      const cbp = ["ControlledByParent"];
      // If either of the sharing models are set to ControlledByParent
      // Then we must include the MasterDetail fields in the change
      if (
        super.isEqual(pieces1.core.sharingModel, cbp) ||
        super.isEqual(pieces1.core.externalSharingModel, cbp)
      ) {
        if (!changes.CustomObject.fields) {
          changes.CustomObject.fields = [];
        }
        // Get any MasterDetail fields that aren't already identified as changes
        const mdtFields = Object.keys(pieces1.components.fields)
          .map((f) => pieces1.components.fields[f])
          // get only MasterDetail fields
          .filter((f) => super.isEqual(f.type, ["MasterDetail"]))
          // get only those not already included in the change detection
          .filter((f) => !changes.CustomObject.fields.includes(f));
        // merge the new fields
        changes.CustomObject.fields.push(...mdtFields);
      }

      changes.CustomObject = Object.assign(changes.CustomObject, pieces1.core);
    }
    return changes;
  }

  normalizeFieldNewLines(mdt) {
    mdt.CustomObject.fields.forEach((f) => {
      if (f.description) {
        f.description = this.cleanNewlineChars(f.description);
      }
      if (f.formula) {
        f.formula = this.cleanNewlineChars(f.formula);
      }
    });
  }

  stripInactivePicklistEntries(mdt) {
    mdt.CustomObject.fields.forEach((f) => {
      if (f.valueSet) {
        console.log(JSON.stringify(f, null, 2));
        f.valueSet[0].valueSetDefinition[0].value = f.valueSet[0].valueSetDefinition[0].value.filter(
          (v) => {
            if (v.isActive && v.isActive[0] === "false") {
              return false;
            }
            return true;
          }
        );
      }
    });
  }

  cleanNewlineChars(textArray) {
    if (!textArray) {
      return textArray;
    }
    // The org often adds/keeps spaces on ending newlines but SFDX Convert drops it while printing the XML
    // Deploying without the extra space doesn't get rid of it
    return textArray.map((t) => t.replace(/ +\n/g, "\n").trim());
  }
}
