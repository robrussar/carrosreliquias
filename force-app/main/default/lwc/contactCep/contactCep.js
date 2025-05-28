import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import buscarPorCEP from '@salesforce/apex/EnderecoSearchController.buscarPorCEP';
import buscarPorEndereco from '@salesforce/apex/EnderecoSearchController.buscarPorEndereco';

export default class EnderecoAutocomplete extends LightningElement {
    @api recordId;
    @api objectApiName;
    
    @track searchTerm = '';
    @track searchResults = [];
    @track showResults = false;
    @track mostraEndereco = false;
    @track endereco = {
        cep: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        estado: ''
    };
    
    delayTimeout;
    
    get comboboxClass() {
        return this.showResults 
            ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' 
            : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    }
    
    get isExpanded() {
        return this.showResults;
    }
    
    handleKeyUp(event) {
        const searchValue = event.target.value;
        this.searchTerm = searchValue;
        
        // Clear any previous timeout
        clearTimeout(this.delayTimeout);
        
        // Debounce the search to avoid too many API calls
        this.delayTimeout = setTimeout(() => {
            this.searchAddresses();
        }, 300);
    }
    
    handleFocus() {
        if (this.searchTerm.length >= 3) {
            this.showResults = true;
        }
    }
    
    handleBlur() {
        // Delay hiding to allow click events to fire first
        setTimeout(() => {
            this.showResults = false;
        }, 300);
    }
    
    async searchAddresses() {
        if (this.searchTerm.length < 3) {
            this.searchResults = [];
            this.showResults = false;
            return;
        }
        
        try {
            // Check if the search term contains only numbers (likely a CEP)
            const isCEP = /^\d+$/.test(this.searchTerm.replace(/\D/g, ''));
            
            if (isCEP && this.searchTerm.replace(/\D/g, '').length >= 5) {
                // Search by CEP
                const results = await buscarPorCEP({ cepParcial: this.searchTerm });
                this.searchResults = results || [];
            } else if (this.searchTerm.length >= 3) {
                // We'll need state and city for this to work with ViaCEP
                // This is a simplification - you might need a different approach
                // or another API that supports searching by partial address
                const results = await buscarPorEndereco({ 
                    uf: 'SP', // Default to São Paulo - modify as needed
                    cidade: 'São Paulo', // Default to São Paulo - modify as needed
                    logradouro: this.searchTerm 
                });
                this.searchResults = results || [];
            }
            
            this.showResults = this.searchResults.length > 0;
        } catch (error) {
            console.error('Error searching addresses', error);
            this.showToast('Erro', 'Ocorreu um erro ao buscar endereços', 'error');
        }
    }
    
    handleSelect(event) {
        const cep = event.currentTarget.dataset.cep;
        const logradouro = event.currentTarget.dataset.logradouro;
        const bairro = event.currentTarget.dataset.bairro;
        const cidade = event.currentTarget.dataset.cidade;
        const estado = event.currentTarget.dataset.estado;
        
        this.endereco = {
            cep: cep,
            logradouro: logradouro,
            bairro: bairro,
            cidade: cidade,
            estado: estado
        };
        
        this.searchTerm = `${logradouro}, ${bairro} - ${cidade}/${estado} - ${cep}`;
        this.showResults = false;
        this.mostraEndereco = true;
    }
    
    handleLogradouroChange(event) {
        this.endereco.logradouro = event.target.value;
    }
    
    handleBairroChange(event) {
        this.endereco.bairro = event.target.value;
    }
    
    handleCepChange(event) {
        this.endereco.cep = event.target.value;
    }
    
    handleCidadeChange(event) {
        this.endereco.cidade = event.target.value;
    }
    
    handleEstadoChange(event) {
        this.endereco.estado = event.target.value;
    }
    
    handleSalvar() {
        if (this.recordId) {
            const fields = {};
            
            fields['Id'] = this.recordId;
            
            if (this.objectApiName === 'Contact') {
                fields['MailingStreet'] = `${this.endereco.logradouro}, ${this.endereco.bairro}`;
                fields['MailingPostalCode'] = this.endereco.cep;
                fields['MailingCity'] = this.endereco.cidade;
                fields['MailingState'] = this.endereco.estado;
                fields['MailingCountry'] = 'Brasil';
            } 
            // Adicione outros objetos se necessário
            
            const recordInput = { fields };
            
            updateRecord(recordInput)
                .then(() => {
                    this.showToast('Sucesso', 'Endereço salvo com sucesso', 'success');
                    this.mostraEndereco = false;
                    this.searchTerm = '';
                })
                .catch(error => {
                    this.showToast('Erro', 'Ocorreu um erro ao salvar o endereço', 'error');
                    console.error('Error saving address', error);
                });
        }
    }
    
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}