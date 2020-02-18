trigger DC_TravelLegTrigger on DC_Travel_Leg__c (before insert, before update, after insert, after update, after delete) {
    DC_TravelLegTriggerHandler handler = new DC_TravelLegTriggerHandler();

    if (Trigger.isBefore) {
        if (Trigger.isInsert) {
            handler.onBeforeInsert();
        }
        if (Trigger.isUpdate) {
            handler.onBeforeUpdate();
        }
    }

    if (Trigger.isAfter) {
        if (Trigger.isInsert) {
            handler.onAfterInsert();
        }
        if (Trigger.isUpdate) {
            handler.onAfterUpdate();
        }
        if (Trigger.isDelete) {
            handler.onAfterDelete();
        }
    }
}