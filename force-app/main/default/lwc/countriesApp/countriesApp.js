import { LightningElement, track } from 'lwc';
import getCountries from '@salesforce/apex/CountryController.getCountries';
import searchCountries from '@salesforce/apex/CountryController.searchCountries';
import { debounce, formatNumber, formatCurrency } from 'c/utils';

export default class CountriesApp extends LightningElement {
    @track countries = [];
    @track error;
    @track isLoading = true;
    @track searchTerm = '';
    
    // URL de fallback para bandeira padrão
    defaultFlagUrl = '/img/icon/t4v35/custom/custom19_60.png'; // Ícone padrão do Salesforce

    connectedCallback() {
        this.loadCountries();
    }

    renderedCallback() {
        // Adiciona handlers de erro para imagens
        this.template.querySelectorAll('img.flag-img').forEach(img => {
            img.onerror = () => {
                img.src = this.defaultFlagUrl;
                img.onerror = null;
            };
        });
    }

    loadCountries() {
        this.isLoading = true;
        this.error = undefined;
        
        const action = this.searchTerm 
            ? searchCountries({ searchTerm: this.searchTerm })
            : getCountries();

        action
            .then(result => {
                this.countries = result.map(country => {
                    const population = Number(country.population) || 0;
                    return {
                        ...country,
                        population: population,
                        formattedPopulation: new Intl.NumberFormat('pt-BR').format(population),
                        flagUrl: country.flagUrl || this.defaultFlagUrl,
                        hasFlag: true // Sempre mostramos uma bandeira (padrão ou real)
                    };
                });
                this.isLoading = false;
            })
            .catch(error => {
                this.error = this.extractErrorMessage(error);
                this.isLoading = false;
                console.error('Error:', error);
            });
    }

    extractErrorMessage(error) {
        if (!error) return 'Unknown error occurred';
        if (typeof error === 'string') return error;
        if (error.body) {
            return Array.isArray(error.body)
                ? error.body.map(e => e.message).join(', ')
                : error.body.message || JSON.stringify(error.body);
        }
        return error.message || 'Failed to load countries';
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.debouncedLoadCountries();
    }

    debouncedLoadCountries = debounce(() => {
        this.loadCountries();
    }, 300);
}