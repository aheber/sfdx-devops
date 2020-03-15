import MetadataDiff from "./type-metadata-base";

export default class LabelDiff extends MetadataDiff {
  getCoreObjectName() {
    return "CustomLabels";
  }
}
