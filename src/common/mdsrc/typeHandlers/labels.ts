/* eslint-disable class-methods-use-this */
import MetadataDiff from './type-metadata-base.js';

export default class LabelDiff extends MetadataDiff {
  public getCoreObjectName(): string {
    return 'CustomLabels';
  }
}
