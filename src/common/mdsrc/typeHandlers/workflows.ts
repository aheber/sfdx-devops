import MetadataDiff from "./type-metadata-base";

export default class WorkflowDiff extends MetadataDiff {
  getCoreObjectName() {
    return "Workflow";
  }
}
