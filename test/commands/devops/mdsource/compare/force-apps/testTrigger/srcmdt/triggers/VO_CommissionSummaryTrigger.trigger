trigger VO_CommissionSummaryTrigger on Commission_Summary__c (after insert,after update){
    VO_CommissionSummaryTriggerHandler csth = new VO_CommissionSummaryTriggerHandler();

    if(Trigger.isBefore){
    }else if(Trigger.isAfter){
        if(Trigger.isInsert){
            csth.onAfterInsertEvents();
        } else if(Trigger.isUpdate){
            csth.onAfterUpdateEvents();
        }
    }
}