import MetadataDiff from "./type-metadata-base";

export default class CustomObjectDiff extends MetadataDiff {
  coreObject = "CustomObject";

  // overridden from the parent so we can do some magic with sharing models
  protected async getChanges(p1, p2) {
    const xmls = await this.loadXMLData(p1, p2);
    // const changes = {} as any;
    // part out into core properties and sub-objects, handle special-case sub-objects
    const pieces1 = super.breakObjectIntoParts(xmls[0]);
    const pieces2 = super.breakObjectIntoParts(xmls[1]);
    const changes = super.getDifferences(
      pieces1.components,
      pieces2.components
    );

    const cbp = ["ControlledByParent"];
    // If either of the sharing models are changing to ControlledByParent
    // Then we must include the MasterDetail fields in the change
    if (
      (super.isEqual(pieces1.core.sharingModel, cbp) &&
        super.isEqual(pieces2.core.sharingModel, cbp) === false) ||
      (super.isEqual(pieces1.core.externalSharingModel, cbp) &&
        super.isEqual(pieces2.core.externalSharingModel, cbp) === false)
    ) {
      if (!changes.CustomObject.fields) {
        changes.CustomObject.fields = [];
      }
      // Get any MasterDetail fields that aren't already identified as changes
      const mdtFields = Object.keys(pieces1.components.fields)
        .map(f => pieces1.components.fields[f])
        // get only MasterDetail fields
        .filter(f => super.isEqual(f.type, ["MasterDetail"]))
        // get only those not already included in the change detection
        .filter(f => !changes.CustomObject.fields.includes(f));
      // merge the new fields
      changes.CustomObject.fields.push(...mdtFields);
    } else {
      // Neither sharing model is trying to become ControlledByParent
      // If they are the same then remove them from the output
      if (super.isEqual(pieces1.core.sharingModel, pieces2.core.sharingModel)) {
        delete pieces1.core.sharingModel;
        delete pieces2.core.sharingModel;
      }
      if (
        super.isEqual(
          pieces1.core.externalSharingModel,
          pieces2.core.externalSharingModel
        )
      ) {
        delete pieces1.core.externalSharingModel;
        delete pieces2.core.externalSharingModel;
      }
    }
    if (
      Object.keys(changes.CustomObject).length > 0 ||
      this.isEqual(pieces1.core, pieces2.core) === false
    ) {
      changes.CustomObject = Object.assign(changes.CustomObject, pieces1.core);
    }
    return changes;
  }
}
