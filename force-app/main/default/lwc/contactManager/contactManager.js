import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import ID_FIELD from '@salesforce/schema/Contact.Id';
import FIRST_NAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LAST_NAME_FIELD from '@salesforce/schema/Contact.LastName';
import MAILING_STREET_FIELD from '@salesforce/schema/Contact.MailingStreet';
import MAILING_CITY_FIELD from '@salesforce/schema/Contact.MailingCity';
import MAILING_STATE_FIELD from '@salesforce/schema/Contact.MailingState';
import MAILING_POSTAL_CODE_FIELD from '@salesforce/schema/Contact.MailingPostalCode';
import MAILING_COUNTRY_FIELD from '@salesforce/schema/Contact.MailingCountry';

export default class ContactAddressForm extends LightningElement {
    @api recordId; // Se estiver editando um contato existente
    
    @track firstName = '';
    @track lastName = '';
    @track mailingStreet = '';
    @track mailingCity = '';
    @track mailingState = '';
    @track mailingPostalCode = '';
    @track mailingCountry = 'Brasil';
    
    // Método para buscar CEP
    async handleCepSearch() {
        const cepInput = this.template.querySelector('lightning-input[data-id="cepInput"]');
        const cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) {
            this.showToast('Erro', 'CEP inválido. Por favor, digite um CEP válido.', 'error');
            return;
        }
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                // Preencher os campos com os dados retornados
                // Combinando logradouro e complemento no campo de rua (MailingStreet)
                this.mailingStreet = data.logradouro + (data.complemento ? ', ' + data.complemento : '');
                this.mailingCity = data.localidade;
                this.mailingState = data.uf;
                this.mailingPostalCode = data.cep.replace('-', '');
                this.mailingCountry = 'Brasil';
                
                this.showToast('Sucesso', 'CEP encontrado com sucesso!', 'success');
            } else {
                this.showToast('Erro', 'CEP não encontrado.', 'error');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            this.showToast('Erro', 'Falha ao buscar o CEP.', 'error');
        }
    }
    
    // Manipuladores de eventos para os campos
    handleFirstNameChange(event) {
        this.firstName = event.target.value;
    }
    
    handleLastNameChange(event) {
        this.lastName = event.target.value;
    }
    
    handleMailingStreetChange(event) {
        this.mailingStreet = event.target.value;
    }
    
    handleMailingCityChange(event) {
        this.mailingCity = event.target.value;
    }
    
    handleMailingStateChange(event) {
        this.mailingState = event.target.value;
    }
    
    handleMailingPostalCodeChange(event) {
        this.mailingPostalCode = event.target.value;
    }
    
    handleMailingCountryChange(event) {
        this.mailingCountry = event.target.value;
    }
    
    // Método para salvar o contato
    handleSave() {
        if (!this.validateFields()) {
            return;
        }
        
        // Preparar os campos para o registro
        const fields = {};
        
        if (this.recordId) {
            fields[ID_FIELD.fieldApiName] = this.recordId;
        }
        
        fields[FIRST_NAME_FIELD.fieldApiName] = this.firstName;
        fields[LAST_NAME_FIELD.fieldApiName] = this.lastName;
        fields[MAILING_STREET_FIELD.fieldApiName] = this.mailingStreet;
        fields[MAILING_CITY_FIELD.fieldApiName] = this.mailingCity;
        fields[MAILING_STATE_FIELD.fieldApiName] = this.mailingState;
        fields[MAILING_POSTAL_CODE_FIELD.fieldApiName] = this.mailingPostalCode;
        fields[MAILING_COUNTRY_FIELD.fieldApiName] = this.mailingCountry;
        
        // Criar ou atualizar o registro
        if (this.recordId) {
            // Atualizar contato existente
            const recordInput = { fields };
            
            updateRecord(recordInput)
                .then(() => {
                    this.showToast('Sucesso', 'Contato atualizado com sucesso!', 'success');
                    this.dispatchEvent(new CustomEvent('success'));
                })
                .catch(error => {
                    console.error('Erro ao atualizar contato:', error);
                    this.showToast('Erro', 'Erro ao atualizar contato: ' + this.reduceErrors(error), 'error');
                });
        } else {
            // Criar novo contato
            const recordInput = { apiName: CONTACT_OBJECT.objectApiName, fields };
            
            createRecord(recordInput)
                .then(result => {
                    this.showToast('Sucesso', 'Contato criado com sucesso!', 'success');
                    this.resetForm();
                    this.dispatchEvent(new CustomEvent('success', {
                        detail: { id: result.id }
                    }));
                })
                .catch(error => {
                    console.error('Erro ao criar contato:', error);
                    this.showToast('Erro', 'Erro ao criar contato: ' + this.reduceErrors(error), 'error');
                });
        }
    }
    
    validateFields() {
        const inputFields = this.template.querySelectorAll('lightning-input, lightning-textarea');
        let isValid = true;
        
        inputFields.forEach(field => {
            if (field.required && !field.value) {
                field.reportValidity();
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    resetForm() {
        this.firstName = '';
        this.lastName = '';
        this.mailingStreet = '';
        this.mailingCity = '';
        this.mailingState = '';
        this.mailingPostalCode = '';
        this.mailingCountry = 'Brasil';
    }
    
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
    
    reduceErrors(errors) {
        if (!Array.isArray(errors)) {
            errors = [errors];
        }
        
        return errors
            .filter(error => !!error)
            .map(error => {
                if (typeof error === 'string') {
                    return error;
                } else if (error.body && typeof error.body.message === 'string') {
                    return error.body.message;
                } else if (error.message) {
                    return error.message;
                }
                return JSON.stringify(error);
            })
            .join(', ');
    }
}