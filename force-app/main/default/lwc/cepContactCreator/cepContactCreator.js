import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { createRecord } from 'lightning/uiRecordApi';
import consultarCep from '@salesforce/apex/CepService.consultarCep';

export default class CepContactCreator extends NavigationMixin(LightningElement) {
    @track endereco = {
        cep: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        estado: ''
    };
    
    @track contact = {
        FirstName: '',
        LastName: '',
        Email: '',
        Phone: '',
        MailingStreet: '',
        MailingCity: '',
        MailingState: '',
        MailingPostalCode: '',
        MailingCountry: 'Brasil'
    };
    
    cepValue = '';
    isSearching = false;
    isSaving = false;
    
    handleFieldChange(event) {
        this.contact[event.target.name] = event.target.value;
    }
    
    // Manipula a mudança no campo de CEP
    handleCepChange(event) {
        this.cepValue = event.target.value;
        
        // Formatação básica do CEP
        if (this.cepValue.length === 5 && !this.cepValue.includes('-')) {
            this.cepValue = this.cepValue + '-';
            event.target.value = this.cepValue;
        }
    }
    
    // Busca o endereço pelo CEP
    handleSearchCep() {
        // Validação básica
        if (!this.cepValue) {
            this.showToast('Atenção', 'Por favor, digite um CEP', 'warning');
            return;
        }
        
        this.isSearching = true;
        
        // Chama o método Apex para consultar o CEP
        consultarCep({ cep: this.cepValue })
            .then(result => {
                console.log('Resultado da consulta:', JSON.stringify(result));
                
                if (result.erro) {
                    this.showToast('Erro', result.mensagem || 'CEP não encontrado', 'error');
                } else {
                    // Preenche os dados do endereço
                    this.endereco = {
                        cep: result.cep || '',
                        logradouro: result.logradouro || '',
                        bairro: result.bairro || '',
                        cidade: result.cidade || '',
                        estado: result.estado || ''
                    };
                    
                    // Atualiza o objeto de contato
                    this.contact.MailingStreet = this.endereco.logradouro;
                    this.contact.MailingCity = this.endereco.cidade;
                    this.contact.MailingState = this.endereco.estado;
                    this.contact.MailingPostalCode = this.endereco.cep;
                    
                    this.showToast('Sucesso', 'Endereço localizado com sucesso', 'success');
                }
            })
            .catch(error => {
                console.error('Erro ao consultar o CEP:', JSON.stringify(error));
                let mensagemErro = 'Houve um problema ao consultar o CEP';
                if (error && error.body && error.body.message) {
                    mensagemErro += ': ' + error.body.message;
                }
                this.showToast('Erro', mensagemErro, 'error');
            })
            .finally(() => {
                this.isSearching = false;
            });
    }
    
    // Salva o contato
    saveContact() {
        // Validações
        if (!this.contact.LastName) {
            this.showToast('Erro', 'O Sobrenome é obrigatório', 'error');
            return;
        }
        
        this.isSaving = true;
        
        // Prepara campos para criação
        const fields = { ...this.contact };
        
        // Remove campos vazios
        Object.keys(fields).forEach(key => {
            if (fields[key] === null || fields[key] === undefined || fields[key] === '') {
                delete fields[key];
            }
        });
        
        // Log para debug
        console.log('Campos para salvar:', JSON.stringify(fields));
        
        // Cria o contato
        const recordInput = { apiName: 'Contact', fields };
        
        createRecord(recordInput)
            .then(result => {
                this.isSaving = false;
                this.showToast('Sucesso', 'Contato criado com sucesso', 'success');
                
                // Navega para o contato criado
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result.id,
                        objectApiName: 'Contact',
                        actionName: 'view'
                    }
                });
            })
            .catch(error => {
                this.isSaving = false;
                console.error('Erro ao salvar contato:', JSON.stringify(error));
                
                let errorMessage = 'Erro ao salvar contato';
                if (error.body && error.body.message) {
                    errorMessage += ': ' + error.body.message;
                } else if (error.body && Array.isArray(error.body)) {
                    errorMessage += ': ' + error.body.map(e => e.message).join(', ');
                }
                
                this.showToast('Erro', errorMessage, 'error');
            });
    }
    
    // Manipula o evento de cancelamento
    handleCancel() {
        // Navega de volta para a lista de contatos
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Contact',
                actionName: 'list'
            }
        });
    }
    
    // Exibe uma mensagem toast
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}