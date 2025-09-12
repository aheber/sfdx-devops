/* eslint-disable unicorn/filename-case */
import MetadataDiff from './type-metadata-base.js';

export default class AssignmentRulesDiff extends MetadataDiff {
  // eslint-disable-next-line class-methods-use-this
  public getCoreObjectName(): string {
    return 'AssignmentRules';
  }
}
