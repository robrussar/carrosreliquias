@IsTest
private class ViaCEPServiceTest {
    
    @IsTest
    static void testBuscarCEPMockResponse() {
        // Cria um mock HTTP para simular a API
        Test.setMock(HttpCalloutMock.class, new ViaCEPMockHttpResponse());
        
        // Executa o teste
        Test.startTest();
        ViaCEPService.EnderecoWrapper resultado = ViaCEPService.buscarCEP('12345-678');
        Test.stopTest();
        
        // Verifica os resultados
        System.assertNotEquals(null, resultado, 'Deveria retornar um objeto não nulo');
        System.assertEquals('Rua Exemplo', resultado.logradouro);
        System.assertEquals('SP', resultado.uf);
        System.assertEquals('São Paulo', resultado.localidade);
        System.assertEquals('Bairro Teste', resultado.bairro);
    }
    
    @IsTest
    static void testBuscarCEPInvalido() {
        // Cria um mock HTTP para simular erro
        Test.setMock(HttpCalloutMock.class, new ViaCEPErrorMockHttpResponse());
        
        // Executa o teste
        Test.startTest();
        ViaCEPService.EnderecoWrapper resultado = ViaCEPService.buscarCEP('00000000');
        Test.stopTest();
        
        // Verifica que o retorno é nulo para CEP inválido
        System.assertEquals(null, resultado, 'Deveria retornar null para CEP inválido');
    }
    
    // Classe mock para simular resposta bem-sucedida da API
    private class ViaCEPMockHttpResponse implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            response.setStatusCode(200);
            response.setBody('{"cep":"12345678","logradouro":"Rua Exemplo","complemento":"","bairro":"Bairro Teste","localidade":"São Paulo","uf":"SP","ibge":"3550308","gia":"1004","ddd":"11","siafi":"7107"}');
            return response;
        }
    }
    
    // Classe mock para simular resposta de erro da API
    private class ViaCEPErrorMockHttpResponse implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest request) {
            HttpResponse response = new HttpResponse();
            response.setStatusCode(200);
            response.setBody('{"erro": true}');
            return response;
        }
    }
}