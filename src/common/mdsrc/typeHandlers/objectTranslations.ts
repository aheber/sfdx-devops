/* eslint-disable unicorn/filename-case */
import MetadataDiff from "./type-metadata-base";

export default class ObjectTranslationDiff extends MetadataDiff {
  getCoreObjectName() {
    return "CustomObjectTranslation";
  }

  getSubComponentNameKey() {
    return {
      fields: "name",
      layouts: "layout",
      quickActions: "name",
      recordTypes: "name",
      validationRules: "name",
      webLinks: "name"
    };
  }
}
