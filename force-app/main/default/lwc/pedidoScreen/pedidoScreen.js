import { LightningElement, wire, track } from 'lwc';
import getPedidos from '@salesforce/apex/PedidoService.getPedidos';
import aprovarPedido from '@salesforce/apex/PedidoService.aprovarPedido';
import cancelarPedido from '@salesforce/apex/PedidoService.cancelarPedido';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class PedidosList extends LightningElement {
    @track pedidos = [];
    @track error;
    @track sortBy;
    @track sortDirection;
    wiredPedidosResult;

    @track columns = [
        { label: 'Número', fieldName: 'Name', type: 'text', sortable: true },
        { 
            label: 'Cliente', 
            fieldName: 'clienteUrl', 
            type: 'url', 
            typeAttributes: {
                label: { fieldName: 'clienteName' },
                target: '_blank'
            },
            sortable: true
        },
        { 
            label: 'Data/Hora Registro', 
            fieldName: 'dataHoraFormatada',  // Campo formatado
            type: 'text',
            sortable: true 
        },
        { 
            label: 'Data', 
            fieldName: 'Data_Pedido__c', 
            type: 'date', 
            typeAttributes: {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            },
            sortable: true
        },
        { 
            label: 'Valor Total', 
            fieldName: 'Valor_Total__c', 
            type: 'currency', 
            typeAttributes: { 
                currencyCode: 'USD',
                currencyDisplayAs: 'symbol'
            },
            sortable: true
        },
        { 
            label: 'Status', 
            fieldName: 'Status__c', 
            type: 'text',
            sortable: true
        },
        {
            type: 'action',
            typeAttributes: { 
                rowActions: { fieldName: 'actions' } 
            }
        }
    ];

    @wire(getPedidos)
    wiredPedidos(result) {
        this.wiredPedidosResult = result;
        const { data, error } = result;
        if (data) {
            // Formatar os dados recebidos
            this.pedidos = data.map(item => {
                let pedido = {...item};

                // Adicionar URL do cliente e nome para a coluna de hiperlink
                if (pedido.Cliente__c) {
                    pedido.clienteUrl = '/' + pedido.Cliente__c;
                    pedido.clienteName = pedido.Cliente__r?.Name;
                }

                // Formatar a data/hora (se não vier já formatada do backend)
                if (pedido.Data_Hora_Pedido__c) {
                    const data = new Date(pedido.Data_Hora_Pedido__c);
                    
                    // Formatação para padrão brasileiro: dd/MM/yyyy HH:mm
                    const dia = data.getDate().toString().padStart(2, '0');
                    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
                    const ano = data.getFullYear();
                    const hora = data.getHours().toString().padStart(2, '0');
                    const minuto = data.getMinutes().toString().padStart(2, '0');
                    
                    pedido.dataHoraFormatada = `${dia}/${mes}/${ano} - ${hora}h${minuto}`;
                }

                // Determinar quais ações estão disponíveis com base no status
                pedido.actions = this.getRowActions(pedido);
                
                return pedido;
            });
            this.error = undefined;
        } else if (error) {
            this.error = 'Erro ao carregar pedidos: ' + error.body?.message || error.message;
            this.pedidos = [];
        }
    }

    getRowActions(row) {
        const actions = [];
        
        // Adicionar ações com base no status do pedido
        if (row.Status__c !== 'Aprovado' && row.Status__c !== 'Cancelado') {
            actions.push({ label: 'Aprovar', name: 'aprovar' });
            actions.push({ label: 'Cancelar', name: 'cancelar' });
        }
        
        return actions;
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        
        switch (action.name) {
            case 'aprovar':
                this.aprovarPedido(row.Id);
                break;
            case 'cancelar':
                this.cancelarPedido(row.Id);
                break;
            default:
                break;
        }
    }

    aprovarPedido(pedidoId) {
        aprovarPedido({ pedidoId })
            .then(() => {
                this.mostrarToast('Sucesso', 'Pedido aprovado com sucesso', 'success');
                return refreshApex(this.wiredPedidosResult);
            })
            .catch(error => {
                this.mostrarToast('Erro', 'Erro ao aprovar pedido: ' + error.body.message, 'error');
            });
    }

    cancelarPedido(pedidoId) {
        cancelarPedido({ pedidoId })
            .then(() => {
                this.mostrarToast('Sucesso', 'Pedido cancelado com sucesso', 'success');
                return refreshApex(this.wiredPedidosResult);
            })
            .catch(error => {
                this.mostrarToast('Erro', 'Erro ao cancelar pedido: ' + error.body.message, 'error');
            });
    }

    mostrarToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }

    handleSort(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldName, direction) {
        const clonedData = [...this.pedidos];
        
        clonedData.sort((a, b) => {
            const valueA = a[fieldName] ? a[fieldName] : '';
            const valueB = b[fieldName] ? b[fieldName] : '';
            
            let comparison = 0;
            if (valueA > valueB) {
                comparison = 1;
            } else if (valueA < valueB) {
                comparison = -1;
            }
            
            return direction === 'asc' ? comparison : -comparison;
        });
        
        this.pedidos = clonedData;
    }
}