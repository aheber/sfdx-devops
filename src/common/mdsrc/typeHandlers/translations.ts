/* eslint-disable unicorn/filename-case */
import MetadataDiff from "./type-metadata-base";

export default class ObjectTranslationDiff extends MetadataDiff {
  getCoreObjectName() {
    return "Translations";
  }

  getSubComponentNameKey() {
    return {
      customApplications: "name",
      customLabels: "name",
      customPageWebLinks: "name",
      customTabs: "name",
      flowDefinitions: "fullName",
      globalPicklists: "name",
      prompts: "name",
      quickActions: "name",
      reportTypes: "name",
      scontrols: "name"
    };
  }
}
