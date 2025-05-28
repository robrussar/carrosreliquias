import { LightningElement, track, api } from 'lwc';
import buscarCep from '@salesforce/apex/CepController.buscarCep';
import testeConexaoViaCep from '@salesforce/apex/CepController.testeConexaoViaCep';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveContact from '@salesforce/apex/ContactController.saveContact';
import getContact from '@salesforce/apex/ContactController.getContact';

export default class ConsultaCep extends LightningElement {
    @track cep = '';
    @track endereco = {
        cep: '',
        logradouro: '',
        bairro: '',
        localidade: '', // cidade
        uf: '',
        pais: ''
    };
    
    @track contato = {
        FirstName: '',
        LastName: '',
        Email: '',
        Phone: '',
        MobilePhone: '',
        Title: '',
        Department: ''
    };
    
    @api recordId; // Para edição de contatos existentes
    
    @track isLoading = false;
    @track hasError = false;
    @track errorMessage = '';
    
    // Opções para o campo de país
    get paisOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Brasil', value: 'Brasil' },
            { label: 'Brazil', value: 'Brazil' },
            { label: 'Estados Unidos', value: 'Estados Unidos' },
            { label: 'Canadá', value: 'Canadá' }
            // Adicione mais países conforme necessário
        ];
    }
    
    // Opções para o campo de estado (UF)
    get estadoOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Acre', value: 'AC' },
            { label: 'Alagoas', value: 'AL' },
            { label: 'Amapá', value: 'AP' },
            { label: 'Amazonas', value: 'AM' },
            { label: 'Bahia', value: 'BA' },
            { label: 'Ceará', value: 'CE' },
            { label: 'Distrito Federal', value: 'DF' },
            { label: 'Espírito Santo', value: 'ES' },
            { label: 'Goiás', value: 'GO' },
            { label: 'Maranhão', value: 'MA' },
            { label: 'Mato Grosso', value: 'MT' },
            { label: 'Mato Grosso do Sul', value: 'MS' },
            { label: 'Minas Gerais', value: 'MG' },
            { label: 'Pará', value: 'PA' },
            { label: 'Paraíba', value: 'PB' },
            { label: 'Paraná', value: 'PR' },
            { label: 'Pernambuco', value: 'PE' },
            { label: 'Piauí', value: 'PI' },
            { label: 'Rio de Janeiro', value: 'RJ' },
            { label: 'Rio Grande do Norte', value: 'RN' },
            { label: 'Rio Grande do Sul', value: 'RS' },
            { label: 'Rondônia', value: 'RO' },
            { label: 'Roraima', value: 'RR' },
            { label: 'Santa Catarina', value: 'SC' },
            { label: 'São Paulo', value: 'SP' },
            { label: 'Sergipe', value: 'SE' },
            { label: 'Tocantins', value: 'TO' }
        ];
    }
    
    handleCepChange(event) {
        this.cep = event.target.value;
    }
    
    handleContactFieldChange(event) {
        const field = event.target.name;
        this.contato[field] = event.target.value;
    }
    
    handleEnderecoFieldChange(event) {
        const field = event.target.name;
        this.endereco[field] = event.target.value;
    }
    
    buscarEndereco() {
        if (!this.cep || this.cep.replace(/[^0-9]/g, '').length < 8) {
            this.showToast('Erro', 'Informe um CEP válido', 'error');
            return;
        }
        
        this.isLoading = true;
        this.hasError = false;
        
        buscarCep({ cep: this.cep })
            .then(result => {
                this.isLoading = false;
                
                if (result.erro) {
                    this.hasError = true;
                    this.errorMessage = 'CEP não encontrado';
                    this.showToast('Erro', 'CEP não encontrado', 'error');
                } else {
                    // Preenche os campos do endereço
                    this.endereco = {
                        cep: result.cep,
                        logradouro: result.logradouro,
                        bairro: result.bairro,
                        localidade: result.localidade, // cidade
                        uf: result.uf,
                        pais: this.endereco.pais || 'Brasil'
                    };
                    
                    this.showToast('Sucesso', 'Endereço encontrado', 'success');
                }
            })
            .catch(error => {
                this.isLoading = false;
                this.hasError = true;
                console.error('Erro ao buscar CEP:', JSON.stringify(error));
                
                let errorMsg = 'Erro ao consultar o CEP';
                if (error.body && error.body.message) {
                    errorMsg = error.body.message;
                }
                
                this.errorMessage = errorMsg;
                this.showToast('Erro', errorMsg, 'error');
            });
    }
    
    salvarContato() {
        // Validação básica
        if (!this.contato.LastName) {
            this.showToast('Erro', 'O sobrenome é obrigatório', 'error');
            return;
        }
        
        this.isLoading = true;
        
        // Converte UF para nome completo do estado para o campo State/Province
        const estadoNomeCompleto = this.getEstadoNomeCompleto(this.endereco.uf);
        
        // Prepara o objeto de contato com endereço
        const contatoCompleto = {
            ...this.contato,
            // Endereço de correspondência (Mailing)
            MailingStreet: this.endereco.logradouro || '',
            MailingCity: this.endereco.localidade || '',
            MailingState: estadoNomeCompleto, // Nome completo do estado
            MailingPostalCode: this.endereco.cep || '',
            MailingCountry: this.endereco.pais || '',
            
            // Outro endereço (Other)
            OtherStreet: this.endereco.logradouro || '',
            OtherCity: this.endereco.localidade || '',
            OtherState: estadoNomeCompleto, // Nome completo do estado
            OtherPostalCode: this.endereco.cep || '',
            OtherCountry: this.endereco.pais || '',
            
            Id: this.recordId // Se for edição, passa o ID
        };
        
        // Adiciona o bairro se existir
        if (this.endereco.bairro) {
            // Adiciona o bairro como parte da rua conforme é comum no Salesforce
            if (contatoCompleto.MailingStreet) {
                contatoCompleto.MailingStreet += ', ' + this.endereco.bairro;
            } else {
                contatoCompleto.MailingStreet = this.endereco.bairro;
            }
            
            if (contatoCompleto.OtherStreet) {
                contatoCompleto.OtherStreet += ', ' + this.endereco.bairro;
            } else {
                contatoCompleto.OtherStreet = this.endereco.bairro;
            }
        }
        
        saveContact({ contactData: JSON.stringify(contatoCompleto) })
            .then(result => {
                this.isLoading = false;
                
                if (result.success) {
                    this.showToast('Sucesso', 'Contato salvo com sucesso', 'success');
                    this.recordId = result.contactId;
                    
                    // Disparar evento para notificar que o registro foi salvo
                    this.dispatchEvent(new CustomEvent('contactsaved', {
                        detail: {
                            contactId: result.contactId
                        }
                    }));
                } else {
                    this.showToast('Erro', result.errorMessage || 'Falha ao salvar o contato', 'error');
                }
            })
            .catch(error => {
                this.isLoading = false;
                console.error('Erro ao salvar contato:', JSON.stringify(error));
                
                let errorMsg = 'Erro ao salvar o contato';
                if (error.body && error.body.message) {
                    errorMsg = error.body.message;
                }
                
                this.showToast('Erro', errorMsg, 'error');
            });
    }
    
    // Método auxiliar para converter a sigla da UF para o nome completo do estado
    getEstadoNomeCompleto(uf) {
        const estadosMap = {
            'AC': 'Acre',
            'AL': 'Alagoas',
            'AP': 'Amapá',
            'AM': 'Amazonas',
            'BA': 'Bahia',
            'CE': 'Ceará',
            'DF': 'Distrito Federal',
            'ES': 'Espírito Santo',
            'GO': 'Goiás',
            'MA': 'Maranhão',
            'MT': 'Mato Grosso',
            'MS': 'Mato Grosso do Sul',
            'MG': 'Minas Gerais',
            'PA': 'Pará',
            'PB': 'Paraíba',
            'PR': 'Paraná',
            'PE': 'Pernambuco',
            'PI': 'Piauí',
            'RJ': 'Rio de Janeiro',
            'RN': 'Rio Grande do Norte',
            'RS': 'Rio Grande do Sul',
            'RO': 'Rondônia',
            'RR': 'Roraima',
            'SC': 'Santa Catarina',
            'SP': 'São Paulo',
            'SE': 'Sergipe',
            'TO': 'Tocantins'
        };
        
        return estadosMap[uf] || '';
    }
    
    testConnection() {
        this.isLoading = true;
        this.showToast('Info', 'Testando conexão com ViaCEP...', 'info');
        
        testeConexaoViaCep()
            .then(result => {
                this.isLoading = false;
                if (result) {
                    this.showToast('Sucesso', 'Conexão com ViaCEP funcionando corretamente!', 'success');
                } else {
                    this.showToast('Erro', 'Falha no teste de conexão com ViaCEP', 'error');
                }
            })
            .catch(error => {
                this.isLoading = false;
                console.error('Erro ao testar conexão:', JSON.stringify(error));
                this.showToast('Erro', 'Falha ao testar conexão', 'error');
            });
    }
    
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }
    
    limparForm() {
        this.cep = '';
        this.endereco = {
            cep: '',
            logradouro: '',
            bairro: '',
            localidade: '',
            uf: '',
            pais: ''
        };
        
        this.contato = {
            FirstName: '',
            LastName: '',
            Email: '',
            Phone: '',
            MobilePhone: '',
            Title: '',
            Department: ''
        };
        
        this.recordId = null;
    }
    
    @api
    loadContact(contactId) {
        if (!contactId) return;
        
        this.isLoading = true;
        this.recordId = contactId;
        
        getContact({ contactId: contactId })
            .then(result => {
                this.isLoading = false;
                this.contato = {
                    FirstName: result.FirstName || '',
                    LastName: result.LastName || '',
                    Email: result.Email || '',
                    Phone: result.Phone || '',
                    MobilePhone: result.MobilePhone || '',
                    Title: result.Title || '',
                    Department: result.Department || ''
                };
                
                // Extrair UF do nome completo do estado
                const uf = this.getSiglaFromEstado(result.MailingState);
                
                // Processar endereço (extraindo bairro da rua se necessário)
                const enderecoDados = this.processarEndereco(result.MailingStreet);
                
                this.endereco = {
                    cep: result.MailingPostalCode || '',
                    logradouro: enderecoDados.logradouro || '',
                    bairro: enderecoDados.bairro || '',
                    localidade: result.MailingCity || '',
                    uf: uf,
                    pais: result.MailingCountry || ''
                };
                
                this.cep = result.MailingPostalCode || '';
            })
            .catch(error => {
                this.isLoading = false;
                console.error('Erro ao carregar contato:', JSON.stringify(error));
                this.showToast('Erro', 'Falha ao carregar o contato', 'error');
            });
    }
    
    // Método para extrair a sigla do UF a partir do nome completo do estado
    getSiglaFromEstado(estadoCompleto) {
        if (!estadoCompleto) return '';
        
        const estadosInverso = {
            'Acre': 'AC',
            'Alagoas': 'AL',
            'Amapá': 'AP',
            'Amazonas': 'AM',
            'Bahia': 'BA',
            'Ceará': 'CE',
            'Distrito Federal': 'DF',
            'Espírito Santo': 'ES',
            'Goiás': 'GO',
            'Maranhão': 'MA',
            'Mato Grosso': 'MT',
            'Mato Grosso do Sul': 'MS',
            'Minas Gerais': 'MG',
            'Pará': 'PA',
            'Paraíba': 'PB',
            'Paraná': 'PR',
            'Pernambuco': 'PE',
            'Piauí': 'PI',
            'Rio de Janeiro': 'RJ',
            'Rio Grande do Norte': 'RN',
            'Rio Grande do Sul': 'RS',
            'Rondônia': 'RO',
            'Roraima': 'RR',
            'Santa Catarina': 'SC',
            'São Paulo': 'SP',
            'Sergipe': 'SE',
            'Tocantins': 'TO'
        };
        
        return estadosInverso[estadoCompleto] || '';
    }
    
    // Método para processar o endereço e extrair bairro se estiver no formato "Rua X, Bairro Y"
    processarEndereco(enderecoCompleto) {
        if (!enderecoCompleto) return { logradouro: '', bairro: '' };
        
        // Se o endereço contém uma vírgula, pode ter o bairro depois da vírgula
        const partes = enderecoCompleto.split(',');
        
        if (partes.length > 1) {
            return {
                logradouro: partes[0].trim(),
                bairro: partes[1].trim()
            };
        } else {
            return {
                logradouro: enderecoCompleto,
                bairro: ''
            };
        }
    }
}