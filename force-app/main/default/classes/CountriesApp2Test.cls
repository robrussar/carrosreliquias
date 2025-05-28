@isTest
private class CountriesApp2Test {
    
    // Dados de teste para países
    private static List<CountryDTO> createTestCountries() {
        List<CountryDTO> countries = new List<CountryDTO>();
        
        // País com todos os dados
        CountryDTO brazil = new CountryDTO();
        brazil.name = 'Brazil';
        brazil.capital = 'Brasília';
        brazil.region = 'Americas';
        brazil.population = 212559417;
        brazil.flagUrl = 'https://example.com/br.png';
        brazil.countryCode = 'BR';
        brazil.timezones = new List<String>{'UTC-03:00'};
        brazil.timezone = 'UTC-03:00';
        brazil.latlng = new List<Decimal>{-10, -55};
        brazil.googleMapsUrl = 'https://maps.google.com/brazil';
        brazil.openStreetMapsUrl = 'https://openstreetmap.org/brazil';
        countries.add(brazil);
        
        // País sem URL de bandeira
        CountryDTO us = new CountryDTO();
        us.name = 'United States';
        us.capital = 'Washington D.C.';
        us.region = 'Americas';
        us.population = 329484123;
        us.flagUrl = null;
        us.countryCode = 'US';
        us.timezones = new List<String>{'UTC-05:00', 'UTC-06:00', 'UTC-07:00', 'UTC-08:00'};
        us.timezone = 'UTC-05:00';
        us.latlng = new List<Decimal>{38, -97};
        us.googleMapsUrl = 'https://maps.google.com/usa';
        us.openStreetMapsUrl = 'https://openstreetmap.org/usa';
        countries.add(us);
        
        // País sem coordenadas específicas
        CountryDTO france = new CountryDTO();
        france.name = 'France';
        france.capital = 'Paris';
        france.region = 'Europe';
        france.population = 67391582;
        france.flagUrl = 'https://example.com/fr.png';
        france.countryCode = 'FR';
        france.timezones = new List<String>{'UTC+01:00'};
        france.timezone = 'UTC+01:00';
        france.latlng = new List<Decimal>{46, 2};
        france.googleMapsUrl = 'https://maps.google.com/france';
        france.openStreetMapsUrl = 'https://openstreetmap.org/france';
        countries.add(france);
        
        // País sem coordenadas geográficas
        CountryDTO japan = new CountryDTO();
        japan.name = 'Japan';
        japan.capital = 'Tokyo';
        japan.region = 'Asia';
        japan.population = 126476461;
        japan.flagUrl = 'https://example.com/jp.png';
        japan.countryCode = 'JP';
        japan.timezones = new List<String>{'UTC+09:00'};
        japan.timezone = 'UTC+09:00';
        japan.latlng = null;
        japan.googleMapsUrl = 'https://maps.google.com/japan';
        japan.openStreetMapsUrl = 'https://openstreetmap.org/japan';
        countries.add(japan);
        
        return countries;
    }
    
    @isTest
    static void testGetCountries() {
        // Configurar dados de teste
        List<CountryDTO> mockCountries = createTestCountries();
        
        // Configurar mock para CountryController.getCountries
        Test.setMock(HttpCalloutMock.class, new CountryControllerTestMock(mockCountries));
        
        Test.startTest();
        List<CountryDTO> result = CountryController.getCountries();
        Test.stopTest();
        
        // Verificações
        System.assertEquals(4, result.size(), 'Deve retornar 4 países');
        System.assertEquals('Brazil', result[0].name);
        System.assertEquals(-10, result[0].latlng[0]);
        System.assertEquals(-55, result[0].latlng[1]);
        System.assertEquals('https://example.com/br.png', result[0].flagUrl);
    }
    
    @isTest
    static void testSearchCountries() {
        // Configurar dados de teste
        List<CountryDTO> mockCountries = createTestCountries();
        
        // Configurar mock para CountryController.searchCountries
        Test.setMock(HttpCalloutMock.class, new CountryControllerTestMock(mockCountries));
        
        Test.startTest();
        List<CountryDTO> result = CountryController.searchCountries('bra');
        Test.stopTest();
        
        // Verificações
        System.assertEquals(1, result.size(), 'Deve retornar 1 país que contenha "bra"');
        System.assertEquals('Brazil', result[0].name);
    }
    
    @isTest
    static void testSearchCountriesNoMatch() {
        // Configurar dados de teste
        List<CountryDTO> mockCountries = createTestCountries();
        
        // Configurar mock para CountryController.searchCountries
        Test.setMock(HttpCalloutMock.class, new CountryControllerTestMock(mockCountries));
        
        Test.startTest();
        List<CountryDTO> result = CountryController.searchCountries('xyz');
        Test.stopTest();
        
        // Verificações
        System.assertEquals(0, result.size(), 'Não deve retornar países para uma busca sem resultados');
    }
    
    @isTest
    static void testGetCountriesException() {
        // Configurar mock para simular exceção
        Test.setMock(HttpCalloutMock.class, new CountryControllerErrorMock());
        
        Test.startTest();
        Boolean exceptionCaught = false;
        try {
            List<CountryDTO> result = CountryController.getCountries();
        } catch (AuraHandledException e) {
            exceptionCaught = true;
        }
        Test.stopTest();
        
        System.assert(exceptionCaught, 'Uma exceção deveria ter sido lançada');
    }
    
    @isTest
    static void testSearchCountriesException() {
        // Configurar mock para simular exceção
        Test.setMock(HttpCalloutMock.class, new CountryControllerErrorMock());
        
        Test.startTest();
        Boolean exceptionCaught = false;
        try {
            List<CountryDTO> result = CountryController.searchCountries('test');
        } catch (AuraHandledException e) {
            exceptionCaught = true;
        }
        Test.stopTest();
        
        System.assert(exceptionCaught, 'Uma exceção deveria ter sido lançada');
    }
    
    // Mock para simulação de resposta HTTP
    private class CountryControllerTestMock implements HttpCalloutMock {
        private List<CountryDTO> countries;
        
        public CountryControllerTestMock(List<CountryDTO> countries) {
            this.countries = countries;
        }
        
        public HttpResponse respond(HttpRequest request) {
            // Converter para o formato que CountryService espera
            String responseBody = '[';
            for (Integer i = 0; i < countries.size(); i++) {
                CountryDTO country = countries[i];
                responseBody += '{';
                responseBody += '"name":{"common":"' + country.name + '","official":"Official ' + country.name + '"},';
                responseBody += '"capital":' + (country.capital != null ? '["' + country.capital + '"]' : '[]') + ',';
                responseBody += '"region":"' + country.region + '",';
                responseBody += '"population":' + country.population + ',';
                responseBody += '"cca2":"' + country.countryCode + '",';
                
                // Adicionar coordenadas quando disponíveis
                responseBody += '"latlng":';
                if (country.latlng != null && !country.latlng.isEmpty()) {
                    responseBody += '[';
                    for (Integer j = 0; j < country.latlng.size(); j++) {
                        responseBody += country.latlng[j];
                        if (j < country.latlng.size() - 1) {
                            responseBody += ',';
                        }
                    }
                    responseBody += ']';
                } else {
                    responseBody += '[]';
                }
                responseBody += ',';
                
                // Adicionar timezones
                responseBody += '"timezones":';
                if (country.timezones != null && !country.timezones.isEmpty()) {
                    responseBody += '[';
                    for (Integer j = 0; j < country.timezones.size(); j++) {
                        responseBody += '"' + country.timezones[j] + '"';
                        if (j < country.timezones.size() - 1) {
                            responseBody += ',';
                        }
                    }
                    responseBody += ']';
                } else {
                    responseBody += '["UTC+00:00"]';
                }
                responseBody += ',';
                
                // Adicionar maps
                responseBody += '"maps":{';
                responseBody += '"googleMaps":"' + (country.googleMapsUrl != null ? country.googleMapsUrl : '') + '",';
                responseBody += '"openStreetMaps":"' + (country.openStreetMapsUrl != null ? country.openStreetMapsUrl : '') + '"';
                responseBody += '},';
                
                // Adicionar capitalInfo para manter a compatibilidade com a API
                responseBody += '"capitalInfo":{"latlng":[]},';
                
                // Adicionar bandeira quando disponível
                responseBody += '"flags":{';
                if (country.flagUrl != null && country.flagUrl != '') {
                    responseBody += '"png":"' + country.flagUrl + '"';
                } else {
                    responseBody += '"png":""';
                }
                responseBody += '}';
                
                responseBody += '}';
                
                if (i < countries.size() - 1) {
                    responseBody += ',';
                }
            }
            responseBody += ']';
            
            HttpResponse response = new HttpResponse();
            response.setStatusCode(200);
            response.setBody(responseBody);
            return response;
        }
    }
    
    // Mock para simular erro HTTP
    private class CountryControllerErrorMock implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            response.setStatusCode(500);
            response.setStatus('Internal Server Error');
            response.setBody('{"error": "Mock server error"}');
            return response;
        }
    }
}