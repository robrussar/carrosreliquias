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
        { id: '2', modelo: 'Brasília', marca: 'Volkswagen', ano: 1975, cor: 'Amarela', valor: 28000 },
        { id: '3', modelo: 'Opala', marca: 'Chevrolet', ano: 1979, cor: 'Preto', valor: 45000 },
        { id: '4', modelo: 'Kombi', marca: 'Volkswagen', ano: 1972, cor: 'Branca', valor: 32000 },
        { id: '5', modelo: 'Variant', marca: 'Volkswagen', ano: 1970, cor: 'Vermelha', valor: 38000 },
        { id: '6', modelo: 'Maverick', marca: 'Ford', ano: 1974, cor: 'Azul', valor: 65000 },
        { id: '7', modelo: 'Gol GT', marca: 'Volkswagen', ano: 1984, cor: 'Vermelho', valor: 25000 },
        { id: '8', modelo: 'Chevette', marca: 'Chevrolet', ano: 1976, cor: 'Bege', valor: 18000 },
        { id: '9', modelo: 'Santana', marca: 'Volkswagen', ano: 1986, cor: 'Prata', valor: 15000 },
        { id: '10', modelo: 'Monza', marca: 'Chevrolet', ano: 1990, cor: 'Azul', valor: 24000 },
        { id: '11', modelo: 'Del Santana', marca: 'Volkswagen', ano: 1997, cor: 'azul', valor: 23000 },
        { id: '13', modelo: 'F1000', marca: 'Ford', ano: 1998, cor: 'Vermelha', valor: 30000 },
        { id: '14', modelo: 'Escort', marca: 'Ford', ano: 1988, cor: 'Preto', valor: 20000 },
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