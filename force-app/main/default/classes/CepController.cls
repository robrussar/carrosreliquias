public with sharing class CepController {
    
    @AuraEnabled
    public static Map<String, Object> buscarCep(String cep) {
        try {
            // Sanitiza o CEP (remove caracteres não numéricos)
            cep = cep.replaceAll('\\D', '');
            
            if (cep.length() != 8) {
                throw new AuraHandledException('CEP deve conter 8 dígitos numéricos');
            }
            
            // Configura a chamada HTTP para a API ViaCEP
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://viacep.com.br/ws/' + cep + '/json/');
            request.setMethod('GET');
            request.setTimeout(30000); // 30 segundos de timeout
            
            // Envia a requisição
            HttpResponse response = http.send(request);
            System.debug('Status code: ' + response.getStatusCode());
            System.debug('Response body: ' + response.getBody());
            
            // Processa a resposta
            if (response.getStatusCode() == 200) {
                // Desserializa o JSON de resposta
                Map<String, Object> result = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
                
                // Verifica se houve erro na API do ViaCEP
                if (result.containsKey('erro') && (Boolean)result.get('erro')) {
                    Map<String, Object> errorResult = new Map<String, Object>();
                    errorResult.put('erro', true);
                    return errorResult;
                }
                
                return result;
            } else {
                throw new AuraHandledException('Erro ao consultar o serviço de CEP: ' + response.getStatusCode() + ' - ' + response.getStatus());
            }
        } catch (AuraHandledException e) {
            throw e;
        } catch (Exception e) {
            System.debug('Erro na consulta de CEP: ' + e.getMessage() + ' | ' + e.getStackTraceString());
            throw new AuraHandledException('Falha ao consultar o CEP: ' + e.getMessage());
        }
    }
    
    // Método para teste usando API pública
    @AuraEnabled
    public static Boolean testeConexaoViaCep() {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://viacep.com.br/ws/01001000/json/');
            request.setMethod('GET');
            request.setTimeout(30000);
            
            HttpResponse response = http.send(request);
            System.debug('Status code: ' + response.getStatusCode());
            System.debug('Response body: ' + response.getBody());
            
            return response.getStatusCode() == 200;
        } catch(Exception e) {
            System.debug('Erro no teste de conexão: ' + e.getMessage());
            return false;
        }
    }
}