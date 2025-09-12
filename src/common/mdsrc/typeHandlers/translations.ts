/* eslint-disable class-methods-use-this */
import MetadataDiff from './type-metadata-base.js';

export default class ObjectTranslationDiff extends MetadataDiff {
  public getCoreObjectName(): string {
    return 'Translations';
  }

  public getSubComponentNameKey(): Record<string, string> {
    return {
      customApplications: 'name',
      customLabels: 'name',
      customPageWebLinks: 'name',
      customTabs: 'name',
      flowDefinitions: 'fullName',
      globalPicklists: 'name',
      prompts: 'name',
      quickActions: 'name',
      reportTypes: 'name',
      scontrols: 'name',
    };
  }
}
