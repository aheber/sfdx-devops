/* eslint-disable unicorn/filename-case */
import MetadataDiff from "./type-metadata-base";

export default class AssignmentRulesDiff extends MetadataDiff {
  getCoreObjectName() {
    return "AssignmentRules";
  }
}
