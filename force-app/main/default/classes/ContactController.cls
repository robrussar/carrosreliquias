public with sharing class ContactController {
    
    @AuraEnabled
    public static Map<String, Object> saveContact(String contactData) {
        Map<String, Object> result = new Map<String, Object>();
        
        try {
            // Desserializar os dados do contato
            Contact contactToSave = (Contact) JSON.deserialize(contactData, Contact.class);
            
            // Verificar se é edição ou inserção
            if (contactToSave.Id == null) {
                // Inserção de um novo contato
                insert contactToSave;
                result.put('contactId', contactToSave.Id);
                result.put('success', true);
                result.put('message', 'Contato criado com sucesso!');
            } else {
                // Atualização de um contato existente
                update contactToSave;
                result.put('contactId', contactToSave.Id);
                result.put('success', true);
                result.put('message', 'Contato atualizado com sucesso!');
            }
        } catch (Exception e) {
            // Tratamento de erro
            result.put('success', false);
            result.put('errorMessage', e.getMessage());
            System.debug('Erro ao salvar contato: ' + e.getMessage() + ' | ' + e.getStackTraceString());
        }
        
        return result;
    }
    
    // Método auxiliar para buscar um contato existente
    @AuraEnabled
    public static Contact getContact(Id contactId) {
        try {
            return [
                SELECT Id, FirstName, LastName, Email, Phone, MobilePhone, Title, Department,
                       MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry,
                       OtherStreet, OtherCity, OtherState, OtherPostalCode, OtherCountry
                FROM Contact
                WHERE Id = :contactId
                LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Erro ao buscar contato: ' + e.getMessage());
        }
    }
}