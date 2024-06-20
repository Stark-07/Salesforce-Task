public with sharing class AppointmentController {
    //@AuraEnabled(cacheable=true)
    //public static List<Appointment_Slots__c> getActiveSlots(Date Apdate) {
    //    return [SELECT Id, Start_Time__c FROM Appointment_Slots__c WHERE Appointment_Date__c = :Apdate AND isActive__c = TRUE];
    //}

    @AuraEnabled
    public static Boolean checkDuplicateAppointment(Date appointmentDate, Time appointmentTime) {
        List<Appointment_Details__c> existingAppointments = [SELECT Id FROM Appointment_Details__c 
                                                             WHERE Appointment_Date__c = :appointmentDate 
                                                             AND Appointment_Time__c = :appointmentTime];
        return !existingAppointments.isEmpty();
    }


    // Method to fetch lookup search result   
    @AuraEnabled(cacheable=true)
    public static list<sObject> fetchLookupData(string searchKey , string sObjectApiName) {    
        List < sObject > returnList = new List < sObject > ();
        string sWildCardText = '%' + searchKey + '%';
        //string sQuery = 'Select id,Start_Time__c,Name From '+ sObjectApiName +' Where isActive__c=True ';
        string sQuery = '';
        //'Select Id, Name From ' + sObjectApiName + 'Where Name Like : sWildCardText ';
        if (sObjectApiName == 'Contact') {
            // Query for Contact
            sQuery = 'SELECT Id, Name FROM Contact Where Name Like : sWildCardText ';
            // result = Database.query(query);
        } else if (sObjectApiName == 'Appointment_Slots__c') {
            // Query for Appointment Slot
            sQuery = 'SELECT Id, Start_Time__c,Appointment_Date__c FROM Appointment_Slots__c WHERE isActive__c = TRUE';
            // result = Database.query(query);
        }
        for (sObject obj: database.query(sQuery)) {
            returnList.add(obj);
        }
        return returnList;
    }
    
    // Method to fetch lookup default value 
    @AuraEnabled
    public static sObject fetchDefaultRecord(string recordId , string sObjectApiName) {
        string sRecId = recordId;    
        string sQuery = 'Select Id,Name From ' + sObjectApiName + ' Where Id = : sRecId LIMIT 1';
        for (sObject obj: database.query(sQuery)) {
            return obj;
        }
        return null;
    }


@AuraEnabled(cacheable=true)
    public static List<Appointment_Slots__c> getActiveSlots() {
        return [SELECT Id, Appointment_Date__c, Start_Time__c, End_Time__c 
                FROM Appointment_Slots__c 
                WHERE isActive__c = true];
    }
    
    @AuraEnabled
    public static Boolean checkDuAppointment(Date appointmentDate, Time appointmentTime) {
        Integer count = [SELECT COUNT() 
                         FROM Appointment_Details__c 
                         WHERE Appointment_Date__c = :appointmentDate 
                         AND Appointment_Time__c = :appointmentTime];
        return count > 0;
    }
    
    @AuraEnabled
    public static Appointment_Details__c saveAppointmentDetails(Appointment_Details__c details) {
        insert details;
        return details;
    }

}