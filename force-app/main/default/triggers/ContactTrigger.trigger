trigger ContactTrigger on Contact (before insert, before update) {
    for (Contact c : Trigger.new) {
        // Lógica específica do seu negócio
        // Exemplo de verificação ou modificação do contato baseado nos dados preenchidos
    }
}