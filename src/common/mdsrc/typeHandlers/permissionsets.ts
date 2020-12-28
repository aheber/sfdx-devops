import MetadataDiff from "./type-metadata-base";

export default class PermissionSetsDiff extends MetadataDiff {
  getCoreObjectName() {
    return "PermissionSet";
  }

  // Don't build partial perm-sets, always deliver the source version
  buildOutput = undefined;

  getSubComponentNameKey() {
    return {
      applicationVisibilities: "application",
      classAccesses: "apexClass",
      customMetadataTypeAccesses: "name",
      customPermissions: "name",
      customSettingAccesses: "name",
      externalDataSourceAccesses: "externalDataSource",
      fieldPermissions: "field",
      objectPermissions: "object",
      pageAccesses: "apexPage",
      recordTypeVisibilities: "recordType",
      tabSettings: "tab",
      userPermissions: "name",
    };
  }
}
