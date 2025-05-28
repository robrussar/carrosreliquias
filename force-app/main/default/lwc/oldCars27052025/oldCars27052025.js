// carrosClassicos.js
import { LightningElement, track } from 'lwc';

export default class CarrosClassicos extends LightningElement {
    @track columns = [
        { label: 'Modelo', fieldName: 'modelo', type: 'text', sortable: true },
        { label: 'Marca', fieldName: 'marca', type: 'text', sortable: true },
        { label: 'Ano', fieldName: 'ano', type: 'number', sortable: true },
        { label: 'Cor', fieldName: 'cor', type: 'text', sortable: true },
        { 
            label: 'Valor', 
            fieldName: 'valor', 
            type: 'currency', 
            typeAttributes: { 
                currencyCode: 'BRL', 
                minimumFractionDigits: 2 
            }, 
            sortable: true 
        }
    ];

    @track data = [
        { id: '1', modelo: 'Fusca', marca: 'Volkswagen', ano: 1969, cor: 'Azul', valor: 35000 },
        { id: '15', modelo: 'Kombi', marca: 'Volkswagen', ano: 1974, cor: 'Bege', valor: 60000 }
    ];

    @track defaultSortDirection = 'asc';
    @track sortDirection = 'asc';
    @track sortedBy;

    sortBy(field, reverse, primer) {
        const key = primer
            ? function(x) {
                  return primer(x[field]);
              }
            : function(x) {
                  return x[field];
              };

        return function(a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
}