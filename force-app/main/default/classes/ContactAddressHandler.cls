/**
 * Classe handler para processamento de CEPs
 */
public class ContactAddressHandler {

    /**
     * Atualiza os campos de endereço nos contatos com base no CEP informado
     */
    public static void updateAddressFromCEP(List<Contact> contacts, Map<Id, String> contactCEPMap) {
        try {
            // Para cada contato que precisa de atualização
            for (Contact contact : contacts) {
                String cep = contact.MailingPostalCode;
                
                // Chama o serviço para buscar o endereço pelo CEP
                ViaCEPService.EnderecoWrapper endereco = ViaCEPService.buscarCEP(cep);
                
                // Se encontrou o endereço, atualiza os campos do contato
                if (endereco != null) {
                    contact.MailingStreet = endereco.logradouro;
                    contact.MailingCity = endereco.localidade;
                    contact.MailingState = endereco.uf;
                    contact.MailingCountry = 'Brasil';
                    
                    // Adiciona o bairro à rua ou ao campo específico, dependendo do modelo de dados
                    if (String.isNotBlank(endereco.bairro)) {
                        // Opção 1: Adicionar bairro no final do endereço
                        if (String.isNotBlank(endereco.logradouro)) {
                            contact.MailingStreet += ', ' + endereco.bairro;
                        } else {
                            contact.MailingStreet = endereco.bairro;
                        }
                        
                        // Opção 2: Se tiver um campo personalizado para bairro
                        // contact.Bairro__c = endereco.bairro;
                    }
                    
                    // Complemento (opcional)
                    if (String.isNotBlank(endereco.complemento)) {
                        // contact.MailingStreet += ' - ' + endereco.complemento;
                        // Ou use um campo personalizado
                        // contact.Complemento__c = endereco.complemento;
                    }
                }
            }
        } catch (Exception e) {
            System.debug('Erro ao processar CEPs: ' + e.getMessage());
        }
    }
}