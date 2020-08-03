export const fieldTypes = {
  text: "text",
  checkbox: "checkbox",
  picklist: "picklist",
};
export const fieldData = {
  type: {
    fieldType: fieldTypes.picklist,
    domSelector:
      "#j_id0:theForm:thePageBlock:editDataSection:editTypeItem:editType",
    domValueMap: {
      Standard: "0",
    },
  },
  windowLanguage: {
    fieldType: fieldTypes.picklist,
    domSelector: "[id$='editWindowLanguage']",
  },
  routingType: {
    fieldType: fieldTypes.picklist,
    domSelector:
      "#j_id0:theForm:thePageBlock:editRoutingSection:rountingTypeSection:editRoutingType",
  },
  autoGreeting: {
    fieldType: fieldTypes.text,
    domSelector:
      "#j_id0:theForm:thePageBlock:editDataSection:editAutoGreetingSection:editAutoGreeting",
  },
  chasitorIdleTimeout: {
    fieldType: fieldTypes.text,
    domSelector: "[id$='editChasitorIdleTimeout']",
  },
  chasitorIdleTimeoutWarning: {
    fieldType: fieldTypes.text,
    domSelector: "[id$='editChasitorIdleTimeoutWarning']",
  },
  customAgentName: {
    fieldType: fieldTypes.text,
    domSelector:
      "#j_id0:theForm:thePageBlock:editDataSection:editCustomAgentNameSection:editCustomAgentName",
  },
  developerName: {
    fieldType: fieldTypes.text,
    domSelector:
      "#j_id0:theForm:thePageBlock:editDataSection:developerNameSection:editDeveloperName",
  },
  enableQueue: {
    fieldType: fieldTypes.checkbox,
    domSelector: "[id$='editHasQueue']",
  },
  isActive: {
    fieldType: fieldTypes.checkbox,
    domSelector:
      "#j_id0:theForm:thePageBlock:editDataSection:editActiveItem:editIsActive",
  },
  label: {
    fieldType: fieldTypes.text,
    domSelector:
      "#j_id0:theForm:thePageBlock:editDataSection:nameSection:editMasterLabel",
  },
  optionsHasChasitorIdleTimeout: {
    fieldType: fieldTypes.checkbox,
    domSelector:
      "#j_id0:theForm:thePageBlock:editDataSection:hasChasitorIdleTimeout:hasChasitorIdleTimeout",
  },
  optionsHasInviteAfterAccept: {
    fieldType: fieldTypes.checkbox,
    domSelector:
      "#j_id0:theForm:thePageBlock:editAnimationSection:editHasInviteAfterAcceptItem:editHasInviteAfterAccept",
  },
  optionsHasInviteAfterReject: {
    fieldType: fieldTypes.checkbox,
    domSelector:
      "#j_id0:theForm:thePageBlock:editAnimationSection:editHasInviteAfterRejectItem:editHasInviteAfterReject",
  },
  optionsHasRerouteDeclinedRequest: {
    fieldType: fieldTypes.checkbox,
    domSelector:
      "#j_id0:theForm:thePageBlock:editRoutingSection:hasRerouteSection:hasRerouteDeclinedRequest",
  },
  optionsIsAutoAccept: {
    fieldType: fieldTypes.checkbox,
    domSelector:
      "#j_id0:theForm:thePageBlock:editRoutingSection:isAutoAccept:isAutoAccept",
  },
  optionsIsInviteAutoRemove: {
    fieldType: fieldTypes.checkbox,
    domSelector:
      "#j_id0:theForm:thePageBlock:editAnimationSection:editTimeToRemoveInviteItem:editTimeToRemoveInvite",
  },
  perAgentQueueLength: {
    fieldType: fieldTypes.text,
    domSelector: "[id$='editPerAgentQueueLength']",
  },
  postChatUrl: {
    fieldType: fieldTypes.text,
    domSelector: "[id$='editPostchatUrlUrl']",
  },
  queue: {
    fieldType: fieldTypes.text,
    domSelector: "[id$='editQueue']",
  },
  overallQueueLength: {
    fieldType: fieldTypes.text,
    domSelector: "[id$='editOverallQueueLength']",
  },
  saveButton: {
    domSelector: "[id$='save']",
  },
};
