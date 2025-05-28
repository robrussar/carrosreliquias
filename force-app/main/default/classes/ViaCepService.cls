public with sharing class ViaCepService {
    public class CepResponse {
        public String logradouro;
        public String localidade;
        public String uf;
        public Boolean erro;
    }

    @AuraEnabled
    public static CepResponse fetchCepData(String cep) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://viacep.com.br/ws/' + cep + '/json/');
        request.setMethod('GET');
        request.setTimeout(2000);
        
        HttpResponse response = http.send(request);
        System.debug('HTTP Response Code: ' + response.getStatusCode());
        
        if (response.getStatusCode() == 200) {
            CepResponse cepData = (CepResponse)JSON.deserialize(response.getBody(), CepResponse.class);
            return cepData;
        } else {
            throw new CalloutException('Failed to retrieve data from ViaCEP API');
        }
    }
}