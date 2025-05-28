import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import CASE_NUMBER_FIELD from '@salesforce/schema/Case.CaseNumber';
import SUBJECT_FIELD from '@salesforce/schema/Case.Subject';
import STATUS_FIELD from '@salesforce/schema/Case.Status';
import PRIORITY_FIELD from '@salesforce/schema/Case.Priority';
import OWNER_ID_FIELD from '@salesforce/schema/Case.OwnerId'; // Alterado para OwnerId
import CREATED_DATE_FIELD from '@salesforce/schema/Case.CreatedDate';
import DESCRIPTION_FIELD from '@salesforce/schema/Case.Description';
import ORIGIN_FIELD from '@salesforce/schema/Case.Origin';
import CONTACT_NAME_FIELD from '@salesforce/schema/Case.Contact.Name';
import CONTACT_TITLE_FIELD from '@salesforce/schema/Case.Contact.Title';
import CONTACT_ACCOUNT_FIELD from '@salesforce/schema/Case.Contact.Account.Name';
import CONTACT_EMAIL_FIELD from '@salesforce/schema/Case.Contact.Email';
import CONTACT_PHONE_FIELD from '@salesforce/schema/Case.Contact.Phone';

const fields = [
    CASE_NUMBER_FIELD,
    SUBJECT_FIELD,
    STATUS_FIELD,
    PRIORITY_FIELD,
    OWNER_ID_FIELD, // Usando OwnerId em vez de Owner.Name
    CREATED_DATE_FIELD,
    DESCRIPTION_FIELD,
    ORIGIN_FIELD,
    CONTACT_NAME_FIELD,
    CONTACT_TITLE_FIELD,
    CONTACT_ACCOUNT_FIELD,
    CONTACT_EMAIL_FIELD,
    CONTACT_PHONE_FIELD
];

export default class ViewCaseBlackTotal extends LightningElement {
    @api recordId;
    
    acceptedFormats = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
    
    @wire(getRecord, { recordId: '$recordId', fields })
    case;
    
    // Adicione este novo wire para obter informações do Owner
    ownerId;
    ownerRecord;
    
    @wire(getRecord, { 
        recordId: '$ownerId', 
        fields: ['User.Name', 'User.SmallPhotoUrl'] 
    })
    wiredOwner({ error, data }) {
        if (data) {
            this.ownerRecord = data;
        } else if (error) {
            console.error('Error loading owner', error);
        }
    }
    
    get caseNumber() {
        return getFieldValue(this.case.data, CASE_NUMBER_FIELD) || '--';
    }
    
    get subject() {
        return getFieldValue(this.case.data, SUBJECT_FIELD) || '--';
    }
    
    get status() {
        return getFieldValue(this.case.data, STATUS_FIELD) || '--';
    }
    
    get priority() {
        return getFieldValue(this.case.data, PRIORITY_FIELD) || '--';
    }
    
    get ownerName() {
        // Obter o nome do owner do registro wireado
        return this.ownerRecord ? getFieldValue(this.ownerRecord, 'User.Name') : 
               getFieldValue(this.case.data, OWNER_ID_FIELD) || '--';
    }
    
    get ownerPhotoUrl() {
        return this.ownerRecord ? getFieldValue(this.ownerRecord, 'User.SmallPhotoUrl') : null;
    }
    
    get createdDate() {
        const date = getFieldValue(this.case.data, CREATED_DATE_FIELD);
        return date ? new Date(date).toLocaleString() : '--';
    }
    
    get description() {
        return getFieldValue(this.case.data, DESCRIPTION_FIELD) || '--';
    }
    
    get origin() {
        return getFieldValue(this.case.data, ORIGIN_FIELD) || '--';
    }
    
    get contactName() {
        return getFieldValue(this.case.data, CONTACT_NAME_FIELD) || '--';
    }
    
    get contactTitle() {
        return getFieldValue(this.case.data, CONTACT_TITLE_FIELD) || '--';
    }
    
    get contactAccount() {
        return getFieldValue(this.case.data, CONTACT_ACCOUNT_FIELD) || '--';
    }
    
    get contactEmail() {
        return getFieldValue(this.case.data, CONTACT_EMAIL_FIELD) || '--';
    }
    
    get contactPhone() {
        return getFieldValue(this.case.data, CONTACT_PHONE_FIELD) || '--';
    }
    
    get lowercaseStatus() {
        return this.status ? this.status.toLowerCase() : '';
    }
    
    get priorityClasses() {
        return `detail-value ${this.priority ? 'priority-' + this.priority.toLowerCase() : ''}`;
    }
    
    // Atualize o ownerId quando os dados do caso forem carregados
    updated(changedProperties) {
        if (changedProperties.has('case') && this.case.data) {
            this.ownerId = getFieldValue(this.case.data, OWNER_ID_FIELD);
        }
    }
    
    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        console.log('Arquivos carregados:', uploadedFiles);
    }
    
    handleBackToList() {
        this.dispatchEvent(new CustomEvent('backtolist'));
    }
    
    handleEdit() {
        this.dispatchEvent(new CustomEvent('edit'));
    }
}