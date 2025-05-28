public with sharing class EnderecoSearchController {
    
    // Método para buscar endereço por CEP usando ViaCEP API
    @AuraEnabled
    public static Map<String, Object> buscarPorCEP(String cepParcial) {
        List<Map<String, Object>> resultados = new List<Map<String, Object>>();
        
        // Limpa o CEP, mantendo apenas números
        String cepLimpo = cepParcial.replaceAll('\\D', '');
        
        if (cepLimpo.length() < 5) {
            return new Map<String, Object>{ 'error' => 'CEP deve ter pelo menos 5 dígitos' };
        }
        
        try {
            // Faz a chamada para a API ViaCEP
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://viacep.com.br/ws/' + cepLimpo + '/json/');
            request.setMethod('GET');
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                Map<String, Object> resultado = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                
                // Verifica se não retornou erro
                if (resultado.containsKey('erro')) {
                    return new Map<String, Object>{ 'error' => 'CEP não encontrado' };
                }
                
                Map<String, Object> endereco = new Map<String, Object>();
                endereco.put('cep', (String) resultado.get('cep'));
                endereco.put('logradouro', (String) resultado.get('logradouro'));
                endereco.put('bairro', (String) resultado.get('bairro'));
                endereco.put('cidade', (String) resultado.get('localidade'));
                endereco.put('estado', (String) resultado.get('uf'));
                endereco.put('display', (String) resultado.get('logradouro') + ', ' + 
                            (String) resultado.get('bairro') + ' - ' + 
                            (String) resultado.get('localidade') + '/' + 
                            (String) resultado.get('uf') + ' - ' + 
                            (String) resultado.get('cep'));
                
                resultados.add(endereco);
                return new Map<String, Object>{ 'results' => resultados };
            } else {
                return new Map<String, Object>{ 'error' => 'Erro ao consultar ViaCEP. Status code: ' + response.getStatusCode() };
            }
        } catch (Exception e) {
            return new Map<String, Object>{ 'error' => 'Erro ao consultar ViaCEP: ' + e.getMessage() };
        }
    }
    
    // Método para buscar endereço por logradouro, cidade e estado
    @AuraEnabled
    public static List<Map<String, Object>> buscarPorEndereco(String uf, String cidade, String logradouro) {
        List<Map<String, Object>> resultados = new List<Map<String, Object>>();
        
        // Validações básicas
        if (String.isBlank(uf) || String.isBlank(cidade) || String.isBlank(logradouro) || logradouro.length() < 3) {
            return resultados;
        }
        
        try {
            // Faz a chamada para a API ViaCEP para busca por endereço
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            
            // Formato da URL para busca por endereço: viacep.com.br/ws/UF/Cidade/Logradouro/json/
            String endpoint = 'https://viacep.com.br/ws/' + 
                EncodingUtil.urlEncode(uf, 'UTF-8') + '/' + 
                EncodingUtil.urlEncode(cidade, 'UTF-8') + '/' + 
                EncodingUtil.urlEncode(logradouro, 'UTF-8') + '/json/';
            
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                List<Object> listaEnderecos = (List<Object>) JSON.deserializeUntyped(response.getBody());
                
                for (Object obj : listaEnderecos) {
                    Map<String, Object> enderecoApi = (Map<String, Object>) obj;
                    Map<String, Object> endereco = new Map<String, Object>();
                    
                    endereco.put('cep', (String) enderecoApi.get('cep'));
                    endereco.put('logradouro', (String) enderecoApi.get('logradouro'));
                    endereco.put('bairro', (String) enderecoApi.get('bairro'));
                    endereco.put('cidade', (String) enderecoApi.get('localidade'));
                    endereco.put('estado', (String) enderecoApi.get('uf'));
                    endereco.put('display', (String) enderecoApi.get('logradouro') + ', ' + 
                               (String) enderecoApi.get('bairro') + ' - ' + 
                               (String) enderecoApi.get('localidade') + '/' + 
                               (String) enderecoApi.get('uf') + ' - ' + 
                               (String) enderecoApi.get('cep'));
                    
                    resultados.add(endereco);
                    
                    // Limita a 10 resultados para não sobrecarregar a interface
                    if (resultados.size() >= 10) {
                        break;
                    }
                }
            }
            
            return resultados;
        } catch (Exception e) {
            System.debug('Erro ao consultar ViaCEP por endereço: ' + e.getMessage());
            return new List<Map<String, Object>>();
        }
    }
}