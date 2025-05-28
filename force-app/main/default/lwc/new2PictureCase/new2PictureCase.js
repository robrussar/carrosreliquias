import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

export default class ContactImageViewer extends LightningElement {
    @api recordId;
    @api imageWidth = '200';
    @api imageHeight = '200';
    richTextContent;
    error;

    get containerStyle() {
        return `max-width: ${this.imageWidth}px; max-height: ${this.imageHeight}px; width: 100%; height: auto;`;
    }

    @wire(getRecord, { recordId: '$recordId', fields: ['Case.Contact.Foto__c'] })
    wiredCase({ error, data }) {
        if (data) {
            const contactField = data.fields.Contact;
            if (contactField && contactField.value && contactField.value.fields.Foto__c) {
                this.richTextContent = contactField.value.fields.Foto__c.value;
            } else {
                this.error = 'Contato ou campo Foto__c não encontrado';
            }
        } else if (error) {
            this.error = 'Erro ao carregar o caso: ' + JSON.stringify(error);
        }
    }
}