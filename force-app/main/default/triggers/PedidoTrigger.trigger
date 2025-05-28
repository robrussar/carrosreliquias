trigger PedidoTrigger on Pedido__c (before insert) {
    // Preenche automaticamente o campo Data_Hora_Pedido__c para novos pedidos
    if (Trigger.isBefore && Trigger.isInsert) {
        for (Pedido__c pedido : Trigger.new) {
            if (pedido.Data_Hora_Pedido__c == null) {
                pedido.Data_Hora_Pedido__c = Datetime.now();
            }
        }
    }
}