/* eslint-disable class-methods-use-this */
import { MetadataDiffCore } from './type-metadata-base.js';

export default class PermissionSetsDiff extends MetadataDiffCore {
  public getCoreObjectName(): string {
    return 'PermissionSet';
  }

  public getSubComponentNameKey(): Record<string, string> {
    return {
      applicationVisibilities: 'application',
      classAccesses: 'apexClass',
      customMetadataTypeAccesses: 'name',
      customPermissions: 'name',
      customSettingAccesses: 'name',
      externalDataSourceAccesses: 'externalDataSource',
      fieldPermissions: 'field',
      objectPermissions: 'object',
      pageAccesses: 'apexPage',
      recordTypeVisibilities: 'recordType',
      tabSettings: 'tab',
      userPermissions: 'name',
    };
  }
}
