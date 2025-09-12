export const fieldTypes = {
  checkbox: 'checkbox',
  picklist: 'picklist',
  text: 'text',
};

type FieldDataConfig = {
  domValueMap?: Record<string, string>;
  domSelector: string;
  fieldType?: keyof typeof fieldTypes;
};
export const fieldData = {
  autoGreeting: {
    domSelector: '#j_id0:theForm:thePageBlock:editDataSection:editAutoGreetingSection:editAutoGreeting',
    fieldType: fieldTypes.text,
  },
  chasitorIdleTimeout: {
    domSelector: "[id$='editChasitorIdleTimeout']",
    fieldType: fieldTypes.text,
  },
  chasitorIdleTimeoutWarning: {
    domSelector: "[id$='editChasitorIdleTimeoutWarning']",
    fieldType: fieldTypes.text,
  },
  customAgentName: {
    domSelector: '#j_id0:theForm:thePageBlock:editDataSection:editCustomAgentNameSection:editCustomAgentName',
    fieldType: fieldTypes.text,
  },
  developerName: {
    domSelector: "[id$='editDeveloperName']",
    fieldType: fieldTypes.text,
  },
  enableQueue: {
    domSelector: "[id$='editHasQueue']",
    fieldType: fieldTypes.checkbox,
  },
  // },
  label: {
    domSelector: "[id$='editMasterLabel']",
    fieldType: fieldTypes.text,
  },
  optionsHasChasitorIdleTimeout: {
    domSelector: '#j_id0:theForm:thePageBlock:editDataSection:hasChasitorIdleTimeout:hasChasitorIdleTimeout',
    fieldType: fieldTypes.checkbox,
  },
  optionsHasInviteAfterAccept: {
    domSelector:
      '#j_id0:theForm:thePageBlock:editAnimationSection:editHasInviteAfterAcceptItem:editHasInviteAfterAccept',
    fieldType: fieldTypes.checkbox,
  },
  // isActive: { // field is now hidden
  //   fieldType: fieldTypes.checkbox,
  //   domSelector: "[id$='editIsActive']",
  optionsHasInviteAfterReject: {
    domSelector:
      '#j_id0:theForm:thePageBlock:editAnimationSection:editHasInviteAfterRejectItem:editHasInviteAfterReject',
    fieldType: fieldTypes.checkbox,
  },
  optionsHasRerouteDeclinedRequest: {
    domSelector: '#j_id0:theForm:thePageBlock:editRoutingSection:hasRerouteSection:hasRerouteDeclinedRequest',
    fieldType: fieldTypes.checkbox,
  },
  optionsIsAutoAccept: {
    domSelector: '#j_id0:theForm:thePageBlock:editRoutingSection:isAutoAccept:isAutoAccept',
    fieldType: fieldTypes.checkbox,
  },
  optionsIsInviteAutoRemove: {
    domSelector: '#j_id0:theForm:thePageBlock:editAnimationSection:editTimeToRemoveInviteItem:editTimeToRemoveInvite',
    fieldType: fieldTypes.checkbox,
  },
  overallQueueLength: {
    domSelector: "[id$='editOverallQueueLength']",
    fieldType: fieldTypes.text,
  },
  perAgentQueueLength: {
    domSelector: "[id$='editPerAgentQueueLength']",
    fieldType: fieldTypes.text,
  },
  postChatUrl: {
    domSelector: "[id$='editPostchatUrlUrl']",
    fieldType: fieldTypes.text,
  },
  queue: {
    domSelector: "[id$='editQueue']",
    fieldType: fieldTypes.text,
  },
  routingType: {
    domSelector: '#j_id0:theForm:thePageBlock:editRoutingSection:rountingTypeSection:editRoutingType',
    fieldType: fieldTypes.picklist,
  },
  saveButton: {
    domSelector: "[id$='save']",
  },
  type: {
    domSelector: '#j_id0:theForm:thePageBlock:editDataSection:editTypeItem:editType',
    domValueMap: {
      Standard: '0',
    },
    fieldType: fieldTypes.picklist,
  },
  windowLanguage: {
    domSelector: "[id$='editWindowLanguage']",
    fieldType: fieldTypes.picklist,
  },
} as Record<string, FieldDataConfig>;
