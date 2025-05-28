public with sharing class CountryService {
    private static final String API_ENDPOINT = 'https://restcountries.com/v3.1/all';
    
    public static List<CountryDTO> getAllCountries() {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(API_ENDPOINT);
        req.setMethod('GET');
        req.setTimeout(120000); // Timeout de 120 segundos
        
        try {
            HttpResponse res = new Http().send(req);
            
            if(res.getStatusCode() == 200) {
                List<Object> countries = (List<Object>)JSON.deserializeUntyped(res.getBody());
                List<CountryDTO> dtos = new List<CountryDTO>();
                
                for(Object countryObj : countries) {
                    try {
                        Map<String, Object> countryMap = (Map<String, Object>)countryObj;
                        dtos.add(CountryDTO.parse(countryMap)); // Usa o método parse atualizado
                    } catch(Exception e) {
                        System.debug('Error parsing country: ' + e.getMessage());
                    }
                }
                
                System.debug('Successfully parsed ' + dtos.size() + ' countries');
                return dtos;
            } else {
                throw new CalloutException('API returned status: ' + res.getStatusCode());
            }
        } catch(Exception e) {
            System.debug('API call failed: ' + e.getMessage());
            throw new CalloutException('Failed to get countries: ' + e.getMessage());
        }
    }
}