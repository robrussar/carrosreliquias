import { LightningElement, track } from 'lwc';
import getCountries from '@salesforce/apex/CountryController.getCountries';
import searchCountries from '@salesforce/apex/CountryController.searchCountries';
import { debounce, formatNumber } from 'c/utils'; // Funções utilitárias

export default class CountriesApp2 extends LightningElement {
    @track countries = [];
    @track error;
    @track isLoading = true;
    @track searchTerm = '';

    // URL de fallback para bandeira padrão
    defaultFlagUrl = '/img/icon/t4v35/custom/custom19_60.png';

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
                    const hasLocation = country.latlng &&
                        Array.isArray(country.latlng) &&
                        country.latlng.length === 2 &&
                        !isNaN(country.latlng[0]) &&
                        !isNaN(country.latlng[1]);

                    // Cria marcadores de mapa com marcador separado para capital
                    const mapMarkers = hasLocation ? [
                        {
                            location: {
                                Latitude: country.latlng[0],
                                Longitude: country.latlng[1]
                            },
                            value: country.name,
                            title: 'País'
                        },
                        {
                            location: {
                                Latitude: country.capitalLatLng ? country.capitalLatLng[0] : country.latlng[0],
                                Longitude: country.capitalLatLng ? country.capitalLatLng[1] : country.latlng[1]
                            },
                            value: country.capital,
                            title: 'Capital'
                        }
                    ] : [];

                    return {
                        ...country,
                        formattedPopulation: formatNumber(country.population, 'pt-BR'),
                        currentTime: this.getCurrentTime(country.timezone),
                        hasLocation: hasLocation,
                        mapMarkers: mapMarkers,
                        mapCenter: hasLocation
                            ? {
                                Latitude: country.latlng[0],
                                Longitude: country.latlng[1]
                            }
                            : null
                    };
                });
                this.isLoading = false;
            })
            .catch(error => {
                this.error = error;
                this.isLoading = false;
                console.error('Error:', error);
            });
    }

    /**
     * Calcula a hora atual com base no fuso horário.
     * @param {String} timezone - O fuso horário no formato "UTC+03:00"
     * @returns {String} - A hora atual formatada
     */
    getCurrentTime(timezone) {
        if (!timezone) {
            return 'Horário indisponível';
        }

        const now = new Date();
        const offset = timezone.replace('UTC', ''); // Remove "UTC" do fuso horário
        const [hours, minutes] = offset.split(':').map(Number); // Separa horas e minutos
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000; // Hora atual em UTC
        const localTime = new Date(utcTime + (hours * 3600 + (minutes || 0) * 60) * 1000); // Adiciona o offset
        return localTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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