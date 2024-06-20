import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import APPOINTMENT_DETAILS_OBJECT from '@salesforce/schema/Appointment_Details__c';
import APPOINTMENT_DATE_FIELD from '@salesforce/schema/Appointment_Details__c.Appointment_Date__c';
import APPOINTMENT_TIME_FIELD from '@salesforce/schema/Appointment_Details__c.Appointment_Time__c';
import CONTACT_FIELD from '@salesforce/schema/Appointment_Details__c.Contact__c';
import SUBJECT_FIELD from '@salesforce/schema/Appointment_Details__c.Subject__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Appointment_Details__c.Description__c';

import getActiveSlots from '@salesforce/apex/AppointmentController.getActiveSlots';
import checkDuplicateAppointment from '@salesforce/apex/AppointmentController.checkDuplicateAppointment';

export default class AppointmentForm extends LightningElement {
    @track subject = '';
    @track description = '';
    @track timeOptions = [];
    @track appTime;
    @track appdate;
    @track con;


    handleInputChange(event) {
        const field = event.target.dataset.id;
        if (field) {
            this[field] = event.target.value;
        }
    }


    handleSave() {
        if (this.isFormValid()) {
            checkDuplicateAppointment({
                appdate: this.appdate,
                appTime: this.appTime
            }).then(isDuplicate => {
                if (isDuplicate) {
                    this.showToast('Error', 'This appointment slot is already taken.', 'error');
                } else {
                    this.saveAppointment();
                }
            }).catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
        } else {
            this.showToast('Error', 'Please fill out all required fields.', 'error');
        }
    }

    saveAppointment() {
        const fields = {};
        fields[CONTACT_FIELD.fieldApiName] = this.con;
        fields[SUBJECT_FIELD.fieldApiName] = this.subject;
        fields[APPOINTMENT_DATE_FIELD.fieldApiName] = this.appdate;
        fields[APPOINTMENT_TIME_FIELD.fieldApiName] = this.appTime;
        fields[DESCRIPTION_FIELD.fieldApiName] = this.description;

        const recordInput = { apiName: APPOINTMENT_DETAILS_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then(() => {
                this.showToast('Success', 'Appointment created', 'success');
                this.resetForm();
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    isFormValid() {
        const inputs = this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }

    resetForm() {
        this.con = '';
        this.subject = '';
        this.appdate = '';
        this.appTime = '';
        this.description = '';
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }

  Appointmenttime(event){
        console.log('Selected Record Value on Parent Component is ' +  JSON.stringify(event.detail.selectedRecord));
        let record=event.detail.selectedRecord;
        if (record && record.Start_Time__c !== undefined) {
            const ms = parseInt(record.Start_Time__c, 10);
            if (!isNaN(ms)) {
                // Calculate hours, minutes, and seconds
                const hours = Math.floor(ms / (1000 * 60 * 60)).toString().padStart(2, '0');
                const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                const seconds = Math.floor((ms % (1000 * 60)) / 1000).toString().padStart(2, '0');
                this.appTime = `${hours}:${minutes}:${seconds}`;
            } else {
                this.appTime = 'Invalid Time';
            }
        }
        
    }
    
    AppointmentDate(event){
        console.log('Selected Record Value on Parent Component is ' +  JSON.stringify(event.detail.selectedRecord));
        let record=event.detail.selectedRecord;
        if (record && record.Appointment_Date__c) {
            this.appdate = new Date(record.Appointment_Date__c);
          //  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
           // this.appdate = date.toLocaleString('en-US', options);
        }
    }
    Contact(event){
        console.log('Selected Record Value on Parent Component is ' +  JSON.stringify(event.detail.selectedRecord));
        let record=event.detail.selectedRecord;
        this.con=record.Id;
    }
}