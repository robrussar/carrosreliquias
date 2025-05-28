public with sharing class ContatoEnderecoController {
    
    /**
     * Método que recebe um JSON com dados de contato vindos do LWC
     * e salva um novo contato no Salesforce
     */
    @AuraEnabled
    public static String salvarContato(String contatoJson) {
        try {
            // Converter o JSON para um mapa
            Map<String, Object> contatoMap = (Map<String, Object>)JSON.deserializeUntyped(contatoJson);
            
            // Criar um novo contato
            Contact novoContato = new Contact();
            
            // Preencher os campos básicos
            if (contatoMap.containsKey('FirstName')) {
                novoContato.FirstName = (String)contatoMap.get('FirstName');
            }
            
            if (contatoMap.containsKey('LastName')) {
                novoContato.LastName = (String)contatoMap.get('LastName');
            } else {
                return 'ERRO: O sobrenome é obrigatório.';
            }
            
            if (contatoMap.containsKey('Email')) {
                novoContato.Email = (String)contatoMap.get('Email');
            }
            
            if (contatoMap.containsKey('Phone')) {
                novoContato.Phone = (String)contatoMap.get('Phone');
            }
            
            if (contatoMap.containsKey('MobilePhone')) {
                novoContato.MobilePhone = (String)contatoMap.get('MobilePhone');
            }
            
            if (contatoMap.containsKey('Title')) {
                novoContato.Title = (String)contatoMap.get('Title');
            }
            
            // Preencher o endereço
            if (contatoMap.containsKey('MailingStreet')) {
                novoContato.MailingStreet = (String)contatoMap.get('MailingStreet');
            }
            
            if (contatoMap.containsKey('MailingCity')) {
                novoContato.MailingCity = (String)contatoMap.get('MailingCity');
            }
            
            // Primeiro processamos o país para depois validar o estado
            String pais = null;
            if (contatoMap.containsKey('MailingCountry')) {
                pais = (String)contatoMap.get('MailingCountry');
                novoContato.MailingCountry = verificarPais(pais);
            }
            
            // Agora processamos o estado de acordo com o país
            if (contatoMap.containsKey('MailingState')) {
                String estado = (String)contatoMap.get('MailingState');
                novoContato.MailingState = verificarEstado(estado, pais);
            }
            
            if (contatoMap.containsKey('MailingPostalCode')) {
                novoContato.MailingPostalCode = (String)contatoMap.get('MailingPostalCode');
            }
            
            // Inserir o contato
            insert novoContato;
            
            return novoContato.Id;
        } catch (Exception e) {
            return 'ERRO: ' + e.getMessage() + ' - Linha: ' + e.getLineNumber();
        }
    }
    
    /**
     * Método que verifica e normaliza o nome do país
     * para o formato aceito pelo Salesforce
     */
    public static String verificarPais(String pais) {
        if (pais == null) {
            return null;
        }
        
        // Mapa com as conversões comuns
        Map<String, String> mapaConversao = new Map<String, String>{
            'BRASIL' => 'Brazil',
            'BRAZIL' => 'Brazil',
            'EUA' => 'United States',
            'ESTADOS UNIDOS' => 'United States',
            'USA' => 'United States'
        };
        
        // Verifica se o país precisa ser convertido
        String paisUpper = pais.toUpperCase();
        if (mapaConversao.containsKey(paisUpper)) {
            return mapaConversao.get(paisUpper);
        }
        
        // Se for um dos nomes padrão, retorna sem alteração
        Set<String> paisesValidos = new Set<String>{
            'Argentina', 'Australia', 'Belgium', 'Brazil', 'Canada', 'China', 
            'France', 'Germany', 'India', 'Italy', 'Japan', 'Mexico', 'Spain', 
            'United Kingdom', 'United States'
        };
        
        if (paisesValidos.contains(pais)) {
            return pais;
        }
        
        // Se não reconhecer o país, retorna nulo para evitar erros
        return null;
    }
    
    /**
     * Método que verifica e normaliza o nome do estado/província
     * para o formato aceito pelo Salesforce, de acordo com o país
     */
    public static String verificarEstado(String estado, String pais) {
        if (estado == null) {
            return null;
        }
        
        // Se o país for Brasil, mapear siglas para nomes completos
        String paisNormalizado = verificarPais(pais);
        
        if (paisNormalizado == 'Brazil') {
            Map<String, String> estadosBrasileiros = new Map<String, String>{
                'AC' => 'Acre',
                'AL' => 'Alagoas',
                'AP' => 'Amapá',
                'AM' => 'Amazonas',
                'BA' => 'Bahia',
                'CE' => 'Ceará',
                'DF' => 'Distrito Federal',
                'ES' => 'Espírito Santo',
                'GO' => 'Goiás',
                'MA' => 'Maranhão',
                'MT' => 'Mato Grosso',
                'MS' => 'Mato Grosso do Sul',
                'MG' => 'Minas Gerais',
                'PA' => 'Pará',
                'PB' => 'Paraíba',
                'PR' => 'Paraná',
                'PE' => 'Pernambuco',
                'PI' => 'Piauí',
                'RJ' => 'Rio de Janeiro',
                'RN' => 'Rio Grande do Norte',
                'RS' => 'Rio Grande do Sul',
                'RO' => 'Rondônia',
                'RR' => 'Roraima',
                'SC' => 'Santa Catarina',
                'SP' => 'São Paulo',
                'SE' => 'Sergipe',
                'TO' => 'Tocantins'
            };
            
            // Se for uma sigla, converter para nome completo
            if (estadosBrasileiros.containsKey(estado.toUpperCase())) {
                return estadosBrasileiros.get(estado.toUpperCase());
            } 
            // Se for nome completo, retornar como está
            else if (estadosBrasileiros.values().contains(estado)) {
                return estado;
            }
        } 
        else if (paisNormalizado == 'United States') {
            // Para EUA, mapear siglas para nomes que o Salesforce reconhece
            Map<String, String> estadosEUA = new Map<String, String>{
                'AL' => 'Alabama',
                'AK' => 'Alaska',
                'AZ' => 'Arizona',
                'AR' => 'Arkansas',
                'CA' => 'California',
                'CO' => 'Colorado',
                'CT' => 'Connecticut',
                'DE' => 'Delaware',
                'FL' => 'Florida',
                'GA' => 'Georgia',
                'HI' => 'Hawaii',
                'ID' => 'Idaho',
                'IL' => 'Illinois',
                'IN' => 'Indiana',
                'IA' => 'Iowa',
                'KS' => 'Kansas',
                'KY' => 'Kentucky',
                'LA' => 'Louisiana',
                'ME' => 'Maine',
                'MD' => 'Maryland',
                'MA' => 'Massachusetts',
                'MI' => 'Michigan',
                'MN' => 'Minnesota',
                'MS' => 'Mississippi',
                'MO' => 'Missouri',
                'MT' => 'Montana',
                'NE' => 'Nebraska',
                'NV' => 'Nevada',
                'NH' => 'New Hampshire',
                'NJ' => 'New Jersey',
                'NM' => 'New Mexico',
                'NY' => 'New York',
                'NC' => 'North Carolina',
                'ND' => 'North Dakota',
                'OH' => 'Ohio',
                'OK' => 'Oklahoma',
                'OR' => 'Oregon',
                'PA' => 'Pennsylvania',
                'RI' => 'Rhode Island',
                'SC' => 'South Carolina',
                'SD' => 'South Dakota',
                'TN' => 'Tennessee',
                'TX' => 'Texas',
                'UT' => 'Utah',
                'VT' => 'Vermont',
                'VA' => 'Virginia',
                'WA' => 'Washington',
                'WV' => 'West Virginia',
                'WI' => 'Wisconsin',
                'WY' => 'Wyoming',
                'DC' => 'District of Columbia'
            };
            
            // Se for uma sigla, converter para nome completo
            if (estadosEUA.containsKey(estado.toUpperCase())) {
                return estadosEUA.get(estado.toUpperCase());
            } 
            // Se for nome completo, retornar como está
            else if (estadosEUA.values().contains(estado)) {
                return estado;
            }
        }
        
        // Para outros países, retornar como está
        return estado;
    }
    
    /**
     * Método que retorna uma lista de picklist values para estados brasileiros
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getEstadosBrasileiros() {
        List<Map<String, String>> estados = new List<Map<String, String>>();
        
        Map<String, String> estadosBrasileiros = new Map<String, String>{
            'AC' => 'Acre',
            'AL' => 'Alagoas',
            'AP' => 'Amapá',
            'AM' => 'Amazonas',
            'BA' => 'Bahia',
            'CE' => 'Ceará',
            'DF' => 'Distrito Federal',
            'ES' => 'Espírito Santo',
            'GO' => 'Goiás',
            'MA' => 'Maranhão',
            'MT' => 'Mato Grosso',
            'MS' => 'Mato Grosso do Sul',
            'MG' => 'Minas Gerais',
            'PA' => 'Pará',
            'PB' => 'Paraíba',
            'PR' => 'Paraná',
            'PE' => 'Pernambuco',
            'PI' => 'Piauí',
            'RJ' => 'Rio de Janeiro',
            'RN' => 'Rio Grande do Norte',
            'RS' => 'Rio Grande do Sul',
            'RO' => 'Rondônia',
            'RR' => 'Roraima',
            'SC' => 'Santa Catarina',
            'SP' => 'São Paulo',
            'SE' => 'Sergipe',
            'TO' => 'Tocantins'
        };
        
        for(String sigla : estadosBrasileiros.keySet()) {
            Map<String, String> estado = new Map<String, String>();
            estado.put('label', estadosBrasileiros.get(sigla) + ' (' + sigla + ')');
            estado.put('value', sigla);
            estados.add(estado);
        }
        
        return estados;
    }
    
    /**
     * Método que retorna uma lista de picklist values para países comuns
     */
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getPaisesComuns() {
        List<Map<String, String>> paises = new List<Map<String, String>>();
        
        List<String> paisesComuns = new List<String>{
            'Brazil', 'United States', 'Argentina', 'Canada', 
            'Mexico', 'United Kingdom', 'France', 'Germany', 
            'Spain', 'Italy', 'Portugal', 'Japan', 'China', 
            'Australia'
        };
        
        for(String pais : paisesComuns) {
            Map<String, String> paisMap = new Map<String, String>();
            paisMap.put('label', pais);
            paisMap.put('value', pais);
            paises.add(paisMap);
        }
        
        return paises;
    }
}