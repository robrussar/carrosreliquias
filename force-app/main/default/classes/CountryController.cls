public with sharing class CountryController {
    @AuraEnabled(cacheable=true)
    public static List<CountryDTO> getCountries() {
        try {
            List<CountryDTO> countries = CountryService.getAllCountries();
            
            // Garantir que todas as bandeiras tenham URLs válidas
            for(CountryDTO country : countries) {
                // Se a URL da bandeira estiver vazia, definir como null para que o LWC use a imagem padrão
                if(String.isBlank(country.flagUrl)) {
                    country.flagUrl = null;
                }
            }
            
            System.debug('Returning ' + countries.size() + ' countries to LWC');
            return countries;
        } catch(Exception e) {
            throw new AuraHandledException('Error getting countries: ' + e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static List<CountryDTO> searchCountries(String searchTerm) {
        try {
            List<CountryDTO> allCountries = CountryService.getAllCountries();
            List<CountryDTO> filtered = new List<CountryDTO>();
            
            for(CountryDTO country : allCountries) {
                if(country.name.toLowerCase().contains(searchTerm.toLowerCase())) {
                    filtered.add(country);
                }
            }
            
            return filtered;
        } catch(Exception e) {
            throw new AuraHandledException('Error searching countries: ' + e.getMessage());
        }
    }
}