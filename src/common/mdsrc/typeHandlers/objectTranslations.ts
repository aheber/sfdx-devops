/* eslint-disable class-methods-use-this */
/* eslint-disable unicorn/filename-case */
import MetadataDiff from './type-metadata-base.js';

export default class ObjectTranslationDiff extends MetadataDiff {
  public getCoreObjectName(): string {
    return 'CustomObjectTranslation';
  }

  public getSubComponentNameKey(): Record<string, string> {
    return {
      fields: 'name',
      layouts: 'layout',
      quickActions: 'name',
      recordTypes: 'name',
      validationRules: 'name',
      webLinks: 'name',
    };
  }
}
