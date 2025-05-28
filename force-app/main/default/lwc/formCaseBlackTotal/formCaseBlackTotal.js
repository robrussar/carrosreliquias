import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import CASE_OBJECT from '@salesforce/schema/Case';
import STATUS_FIELD from '@salesforce/schema/Case.Status';
import PRIORITY_FIELD from '@salesforce/schema/Case.Priority';

export default class FormCaseBlackTotal extends NavigationMixin(LightningElement) {
    @api recordId;
    
    // Valores padrão
    defaultValues = {
        [STATUS_FIELD.fieldApiName]: 'New',
        [PRIORITY_FIELD.fieldApiName]: 'Medium'
    };

    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: 'Caso criado',
            message: 'Caso criado com sucesso: ' + event.detail.id,
            variant: 'success',
        });
        this.dispatchEvent(evt);
        
        // Navega para a visualização do caso
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.detail.id,
                objectApiName: 'Case',
                actionName: 'view'
            }
        });
    }

    handleCancel() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Case',
                actionName: 'list'
            }
        });
    }
}