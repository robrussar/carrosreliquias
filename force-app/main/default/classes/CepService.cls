public with sharing class CepService {
    
    @AuraEnabled
    public static String getCepInfo(String cep) {
        try {
            // Remove qualquer caractere que não seja número
            cep = cep.replaceAll('\\D', '');
            
            // Verifica se o CEP tem 8 dígitos
            if (cep.length() != 8) {
                return null;
            }
            
            // Formata a URL para a API ViaCEP
            String endpoint = 'https://viacep.com.br/ws/' + cep + '/json/';
            
            // Faz a chamada HTTP
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            request.setTimeout(20000); // 20 segundos de timeout
            
            // Envia a requisição e obtém a resposta
            HttpResponse response = http.send(request);
            
            // Verifica o resultado
            if (response.getStatusCode() == 200) {
                return response.getBody();
            } else {
                System.debug('Erro na chamada da API ViaCEP: ' + response.getStatusCode() + ' ' + response.getStatus());
                return null;
            }
        } catch (Exception e) {
            System.debug('Exceção ao buscar CEP: ' + e.getMessage());
            throw new AuraHandledException('Erro ao buscar o CEP: ' + e.getMessage());
        }
    }
}