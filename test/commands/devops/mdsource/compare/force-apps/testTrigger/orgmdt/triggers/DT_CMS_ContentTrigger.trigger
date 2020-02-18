trigger DT_CMS_ContentTrigger on DT_CMS_Content__c (before insert, before update) {
    DT_CMS_ContentTriggerHandler.ensureValidJSON(Trigger.new);
}