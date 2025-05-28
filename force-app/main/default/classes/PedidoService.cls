public class PedidoService {
    /**
     * Retorna a lista de pedidos com todos os campos necessários
     * @return List<Pedido__c> Lista de pedidos
     */
    @AuraEnabled(cacheable=true)
    public static List<Pedido__c> getPedidos() {
        try {
            return [
                SELECT Id, Name, Cliente__c, Cliente__r.Name, Data_Pedido__c, 
                       Data_Hora_Pedido__c, Valor_Total__c, Status__c
                FROM Pedido__c
                ORDER BY CreatedDate DESC
            ];
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Erro ao buscar pedidos: ' + e.getMessage());
            throw new AuraHandledException('Erro ao buscar pedidos: ' + e.getMessage());
        }
    }
    
    /**
     * Aprova um pedido específico
     * @param pedidoId Id do pedido a ser aprovado
     * @return Boolean Indica se a operação foi bem-sucedida
     */
    @AuraEnabled
    public static Boolean aprovarPedido(Id pedidoId) {
        try {
            Pedido__c pedido = [SELECT Id, Status__c FROM Pedido__c WHERE Id = :pedidoId];
            
            // Verifica se o pedido já está aprovado ou cancelado
            if (pedido.Status__c == 'Aprovado' || pedido.Status__c == 'Cancelado') {
                throw new AuraHandledException('Não é possível aprovar um pedido já ' + pedido.Status__c);
            }
            
            // Atualiza o status do pedido
            pedido.Status__c = 'Aprovado';
            update pedido;
            
            return true;
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Erro ao aprovar pedido: ' + e.getMessage());
            throw new AuraHandledException('Erro ao aprovar pedido: ' + e.getMessage());
        }
    }
    
    /**
     * Cancela um pedido específico
     * @param pedidoId Id do pedido a ser cancelado
     * @return Boolean Indica se a operação foi bem-sucedida
     */
    @AuraEnabled
    public static Boolean cancelarPedido(Id pedidoId) {
        try {
            Pedido__c pedido = [SELECT Id, Status__c FROM Pedido__c WHERE Id = :pedidoId];
            
            // Verifica se o pedido já está aprovado ou cancelado
            if (pedido.Status__c == 'Aprovado' || pedido.Status__c == 'Cancelado') {
                throw new AuraHandledException('Não é possível cancelar um pedido já ' + pedido.Status__c);
            }
            
            // Atualiza o status do pedido
            pedido.Status__c = 'Cancelado';
            update pedido;
            
            return true;
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Erro ao cancelar pedido: ' + e.getMessage());
            throw new AuraHandledException('Erro ao cancelar pedido: ' + e.getMessage());
        }
    }
    
    /**
     * Cria um novo pedido
     * @param novoPedido Objeto Pedido__c com os dados do novo pedido
     * @return Id ID do pedido criado
     */
    @AuraEnabled
    public static Id criarPedido(Pedido__c novoPedido) {
        try {
            // Valida os campos obrigatórios
            if (novoPedido.Cliente__c == null) {
                throw new AuraHandledException('Cliente é obrigatório');
            }
            
            // Define valores padrão
            if (novoPedido.Data_Pedido__c == null) {
                novoPedido.Data_Pedido__c = Date.today();
            }
            
            // Data_Hora_Pedido__c será preenchido automaticamente pelo trigger
            
            // Status padrão
            if (novoPedido.Status__c == null) {
                novoPedido.Status__c = 'Novo';
            }
            
            insert novoPedido;
            return novoPedido.Id;
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Erro ao criar pedido: ' + e.getMessage());
            throw new AuraHandledException('Erro ao criar pedido: ' + e.getMessage());
        }
    }
    
    /**
     * Atualiza um pedido existente
     * @param pedidoAtualizado Objeto Pedido__c com os dados atualizados
     * @return Boolean Indica se a operação foi bem-sucedida
     */
    @AuraEnabled
    public static Boolean atualizarPedido(Pedido__c pedidoAtualizado) {
        try {
            // Verifica se o pedido existe
            Pedido__c pedidoExistente = [
                SELECT Id, Status__c 
                FROM Pedido__c 
                WHERE Id = :pedidoAtualizado.Id
            ];
            
            // Verifica se o pedido pode ser atualizado
            if (pedidoExistente.Status__c == 'Aprovado' || pedidoExistente.Status__c == 'Cancelado') {
                throw new AuraHandledException('Não é possível atualizar um pedido ' + pedidoExistente.Status__c);
            }
            
            update pedidoAtualizado;
            return true;
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Erro ao atualizar pedido: ' + e.getMessage());
            throw new AuraHandledException('Erro ao atualizar pedido: ' + e.getMessage());
        }
    }
    
    /**
     * Busca um pedido específico pelo ID
     * @param pedidoId ID do pedido a ser buscado
     * @return Pedido__c Objeto com os dados do pedido
     */
    @AuraEnabled(cacheable=true)
    public static Pedido__c getPedidoById(Id pedidoId) {
        try {
            return [
                SELECT Id, Name, Cliente__c, Cliente__r.Name, Data_Pedido__c,
                       Data_Hora_Pedido__c, Valor_Total__c, Status__c
                FROM Pedido__c
                WHERE Id = :pedidoId
            ];
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Erro ao buscar pedido: ' + e.getMessage());
            throw new AuraHandledException('Erro ao buscar pedido: ' + e.getMessage());
        }
    }
    
    /**
     * Classe auxiliar para lidar com exceções do serviço
     */
    public class PedidoException extends Exception {}
}