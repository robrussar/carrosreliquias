public with sharing class CountryDTO {
    @AuraEnabled
    public String name { get; set; }
    
    @AuraEnabled
    public String capital { get; set; }
    
    @AuraEnabled
    public String region { get; set; }
    
    @AuraEnabled
    public Decimal population { get; set; }
    
    @AuraEnabled
    public String flagUrl { get; set; }
    
    @AuraEnabled
    public String countryCode { get; set; }
    
    @AuraEnabled
    public List<String> timezones { get; set; } // Lista de fusos horários
    
    @AuraEnabled
    public List<Decimal> latlng { get; set; } // Coordenadas gerais do país (latitude e longitude)

    @AuraEnabled
    public String googleMapsUrl { get; set; } // Link para Google Maps
    
    @AuraEnabled
    public String openStreetMapsUrl { get; set; } // Link para OpenStreetMap

    @AuraEnabled
    public String timezone { get; set; } // Primeiro fuso horário para facilitar o uso no LWC

    public static CountryDTO parse(Map<String, Object> countryMap) {
        CountryDTO dto = new CountryDTO();

        // Nome do país
        Map<String, Object> nameMap = (Map<String, Object>)countryMap.get('name');
        dto.name = (String)nameMap.get('common');
        
        // Capital
        List<Object> capitals = (List<Object>)countryMap.get('capital');
        dto.capital = capitals != null && !capitals.isEmpty() ? (String)capitals[0] : 'N/A';
        
        // Região
        dto.region = (String)countryMap.get('region');
        
        // População
        Object populationObj = countryMap.get('population');
        dto.population = populationObj != null ? Decimal.valueOf(String.valueOf(populationObj)) : 0;
        
        // Bandeira
        Map<String, Object> flags = (Map<String, Object>)countryMap.get('flags');
        dto.flagUrl = flags != null ? (String)flags.get('png') : '';
        
        // Código do país
        dto.countryCode = (String)countryMap.get('cca2');
        
        // Fusos horários
        List<Object> timezonesList = (List<Object>)countryMap.get('timezones');
        dto.timezones = new List<String>();
        if (timezonesList != null) {
            for (Object timezone : timezonesList) {
                dto.timezones.add((String)timezone); // Converte cada elemento para String
            }
        }
        
        // Primeiro fuso horário
        dto.timezone = dto.timezones != null && !dto.timezones.isEmpty() ? dto.timezones[0] : 'UTC+00:00';

        // Coordenadas gerais (latitude e longitude)
        List<Object> latlngList = (List<Object>)countryMap.get('latlng');
        dto.latlng = new List<Decimal>();
        if (latlngList != null) {
            for (Object coord : latlngList) {
                dto.latlng.add(Decimal.valueOf(String.valueOf(coord))); // Converte cada elemento para Decimal
            }
        }
        
        // Links de mapas
        Map<String, Object> mapsMap = (Map<String, Object>)countryMap.get('maps');
        dto.googleMapsUrl = mapsMap != null ? (String)mapsMap.get('googleMaps') : '';
        dto.openStreetMapsUrl = mapsMap != null ? (String)mapsMap.get('openStreetMaps') : '';

        return dto;
    }
}