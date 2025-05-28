@isTest
private class CountryServiceTest {
    
    @isTest
    static void testGetAllCountriesSuccess() {
        // Configurar mock para HTTP callout
        Test.setMock(HttpCalloutMock.class, new CountryAPIMock(200));
        
        Test.startTest();
        List<CountryDTO> countries = CountryService.getAllCountries();
        Test.stopTest();
        
        // Verificar resultados
        System.assertNotEquals(null, countries);
        System.assertEquals(3, countries.size());
        System.assertEquals('Brazil', countries[0].name);
        
        System.assertEquals('South America', countries[0].region);
    }
    
    @isTest
    static void testGetAllCountriesAPIError() {
        // Configurar mock para HTTP callout com erro
        Test.setMock(HttpCalloutMock.class, new CountryAPIMock(500));
        
        Test.startTest();
        try {
            CountryService.getAllCountries();
            System.assert(false, 'Expected exception was not thrown');
        } catch(CalloutException e) {
            System.assert(e.getMessage().contains('API returned status: 500'));
        }
        Test.stopTest();
    }
    
    @isTest
    static void testGetAllCountriesParseError() {
        // Configurar mock para HTTP callout com JSON inválido
        Test.setMock(HttpCalloutMock.class, new CountryAPIMock(200, 'Invalid JSON'));
        
        Test.startTest();
        try {
            CountryService.getAllCountries();
            System.assert(false, 'Expected exception was not thrown');
        } catch(Exception e) {
            System.assert(e.getMessage().contains('Failed to get countries'));
        }
        Test.stopTest();
    }
    
    // Mock de resposta HTTP para a API de países
    private class CountryAPIMock implements HttpCalloutMock {
        private Integer statusCode;
        private String body;
        
        public CountryAPIMock(Integer statusCode) {
            this.statusCode = statusCode;
            this.body = getDefaultResponseBody();
        }
        
        public CountryAPIMock(Integer statusCode, String body) {
            this.statusCode = statusCode;
            this.body = body;
        }
        
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            response.setStatusCode(statusCode);
            response.setBody(body);
            return response;
        }
        
        private String getDefaultResponseBody() {
            return '[' +
                   '{"name":{"common":"Brazil","official":"Federative Republic of Brazil"},' +
                   '"cca2":"BR","region":"South America",' +
                   '"flags":{"png":"https://flagcdn.com/w320/br.png"}},' +
                   '{"name":{"common":"United States","official":"United States of America"},' +
                   '"cca2":"US","region":"North America",' +
                   '"flags":{"png":"https://flagcdn.com/w320/us.png"}},' +
                   '{"name":{"common":"France","official":"French Republic"},' +
                   '"cca2":"FR","region":"Europe",' +
                   '"flags":{}}' +
                   ']';
        }
    }
}