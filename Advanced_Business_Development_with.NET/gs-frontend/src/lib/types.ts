// src/lib/types.ts

// =====================================================================================
// TIPOS GENÉRICOS (Ex: Paginação)
// =====================================================================================

/**
 * Estrutura genérica para respostas paginadas da API.
 * Baseado na estrutura de paginação comum observada nos controllers C#.
 */
export interface Page<T> {
    content: T[];
    totalElements: number;
    pageNumber: number; // Geralmente baseado em 1 vindo da API
    pageSize: number;
    totalPages: number;
    first?: boolean; // Propriedades comuns de paginação, podem ser úteis
    last?: boolean;
    empty?: boolean;
}

// =====================================================================================
// DTOs de REQUISIÇÃO (Frontend para Backend)
// =====================================================================================

/**
 * DTO para detalhes de um evento que pode gerar um alerta.
 * Correspondente a: gsApi.dto.request.AlertableEventDto
 * (convertidosCsemTxt.txt, source: 1216-1221)
 */
export interface AlertableEventDTO {
    eventId?: string;
    title?: string;
    eventDate?: string;
    link?: string;
    description?: string;
}

/**
 * DTO para criar ou atualizar um cliente.
 * Correspondente a: gsApi.dto.request.ClienteRequestDto
 * (convertidosCsemTxt.txt, source: 1221-1228)
 */
export interface ClienteRequestDTO {
    nome: string;
    sobrenome: string;
    dataNascimento: string; // Formato YYYY-MM-DD ou DD/MM/YYYY
    documento: string;
    contatosIds?: number[];
    enderecosIds?: number[];
}

/**
 * DTO para criar ou atualizar um contato.
 * Correspondente a: SeuProjetoNET.DTOs.Request.ContatoRequestDto
 * (convertidosCsemTxt.txt, source: 1228-1236)
 */
export interface ContatoRequestDTO {
    ddd: string;
    telefone: string;
    celular: string; // Embora o C# tenha string, no frontend pode ser opcional se a lógica permitir
    whatsapp: string; // Similar ao celular
    email: string;
    tipoContato: string;
}

/**
 * DTO para solicitar geocodificação de um endereço.
 * Correspondente a: SeuProjetoNET.DTOs.Request.EnderecoGeoRequestDto
 * (convertidosCsemTxt.txt, source: 1236-1243)
 */
export interface EnderecoGeoRequestDTO {
    logradouro: string;
    numero?: string;
    cidade: string;
    uf: string;
    bairro?: string;
    cep?: string;
}

/**
 * DTO para criar ou atualizar um endereço.
 * Correspondente a: SeuProjetoNET.DTOs.Request.EnderecoRequestDto
 * (convertidosCsemTxt.txt, source: 1243-1253)
 */
export interface EnderecoRequestDTO {
    cep: string;
    numero: number;
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    complemento: string;
    latitude: number;
    longitude: number;
}

/**
 * DTO para criar ou atualizar um evento EONET localmente.
 * Correspondente a: SeuProjetoNET.DTOs.Request.EonetRequestDto
 * (convertidosCsemTxt.txt, source: 1253-1257)
 */
export interface EonetRequestDTO {
    json: string; // Conteúdo JSON do evento
    data: string; // DateTimeOffset será uma string no formato ISO 8601
    eonetIdApi: string;
}

/**
 * DTO para detalhes de um evento ao disparar um alerta para usuário.
 * Parte de UserAlertRequestDTO.
 * (convertidosCsemTxt.txt, source: 1261-1264)
 */
export interface EventDetailsDTO {
    eventId?: string; // Adicionado, pois é comum ter um ID
    title: string;
    description?: string; // No C# é `string Description { get; set; }` (anulável por padrão)
    // Adicionando campos que podem ser úteis do AlertableEventDTO
    eventDate?: string;
    link?: string;
}

/**
 * DTO para disparar um alerta específico para um usuário.
 * Correspondente a: gsApi.DTOs.Request.UserAlertRequestDto
 * (convertidosCsemTxt.txt, source: 1257-1261)
 */
export interface UserAlertRequestDTO {
    userId: number;
    eventDetails: EventDetailsDTO;
}


// =====================================================================================
// DTOs de RESPOSTA (Backend para Frontend)
// =====================================================================================

/**
 * DTO para contagem de eventos por categoria.
 * Correspondente a: SeuProjetoNET.DTOs.Response.CategoryCountDto
 * (convertidosCsemTxt.txt, source: 1264-1267)
 */
export interface CategoryCountDTO {
    categoryTitle: string;
    count: number; // C# long -> TypeScript number
}

/**
 * DTO para resposta de dados de um cliente.
 * Correspondente a: gsApi.dto.response.ClienteResponseDto
 * (convertidosCsemTxt.txt, source: 1267-1274)
 */
export interface ClienteResponseDTO {
    idCliente: number; // C# long -> TypeScript number
    nome: string;
    sobrenome: string;
    dataNascimento: string; // Manter como string, formatação no frontend
    documento: string;
    contatos: ContatoResponseDTO[];
    enderecos: EnderecoResponseDTO[];
}

/**
 * DTO para resposta de dados de um contato.
 * Correspondente a: SeuProjetoNET.DTOs.Response.ContatoResponseDto
 * (convertidosCsemTxt.txt, source: 1274-1283)
 */
export interface ContatoResponseDTO {
    idContato: number; // C# long -> TypeScript number
    ddd: string;
    telefone: string;
    celular: string;
    whatsapp: string;
    email: string;
    tipoContato: string;
    // Frontend parece não precisar da lista de clientes aqui, mas se precisar:
    // clientes?: ClienteResponseDTO[]; // Se for necessário carregar os clientes associados
}

/**
 * DTO para resposta de dados de um endereço.
 * Correspondente a: SeuProjetoNET.DTOs.Response.EnderecoResponseDto
 * (convertidosCsemTxt.txt, source: 1283-1293)
 */
export interface EnderecoResponseDTO {
    idEndereco: number; // C# long -> TypeScript number
    cep: string;
    numero: number;
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    complemento?: string; // C# é string, mas pode ser opcional no DTO de resposta se nem sempre preenchido
    latitude: number;
    longitude: number;
    // Frontend parece não precisar da lista de clientes ou eventos aqui, mas se precisar:
    // clientes?: ClienteResponseDTO[];
    // eventosEonet?: EonetResponseDTO[];
}

/**
 * DTO para resposta de dados de um evento EONET armazenado localmente.
 * Correspondente a: SeuProjetoNET.DTOs.Response.EonetResponseDto
 * (convertidosCsemTxt.txt, source: 1293-1297)
 */
export interface EonetResponseDTO {
    idEonet: number; // C# long -> TypeScript number
    json?: string;
    data?: string; // DateTimeOffset? -> string ISO 8601 opcional
    eonetIdApi: string;
}

/**
 * DTO para resposta de coordenadas geográficas.
 * Correspondente a: SeuProjetoNET.DTOs.Response.GeoCoordinatesDto
 * (convertidosCsemTxt.txt, source: 1297-1300)
 */
export interface GeoCoordinatesDTO {
    latitude: number;
    longitude: number;
    matchedAddress?: string;
}

/**
 * DTO para a resposta da API de Geocoding do Google (nível raiz).
 * Correspondente a: SeuProjetoNET.DTOs.Response.GoogleGeocodingApiResponseDto
 * (convertidosCsemTxt.txt, source: 1300-1304)
 */
export interface GoogleGeocodingApiResponseDTO {
    results: GoogleGeocodingResultDTO[];
    status: string;
    error_message?: string; // No C# é ErrorMessage
}

/**
 * DTO para a geometria em uma resposta de Geocoding do Google.
 * Correspondente a: SeuProjetoNET.DTOs.Response.GoogleGeocodingGeometryDto
 * (convertidosCsemTxt.txt, source: 1304-1306)
 */
export interface GoogleGeocodingGeometryDTO {
    location: GoogleGeocodingLocationDTO;
}

/**
 * DTO para a localização (lat/lng) em uma resposta de Geocoding do Google.
 * Correspondente a: SeuProjetoNET.DTOs.Response.GoogleGeocodingLocationDto
 * (convertidosCsemTxt.txt, source: 1306-1309)
 */
export interface GoogleGeocodingLocationDTO {
    lat: number; // No C# é Latitude
    lng: number; // No C# é Longitude
}

/**
 * DTO para um resultado individual na resposta de Geocoding do Google.
 * Correspondente a: SeuProjetoNET.DTOs.Response.GoogleGeocodingResultDto
 * (convertidosCsemTxt.txt, source: 1309-1314)
 */
export interface GoogleGeocodingResultDTO {
    formatted_address: string; // No C# é FormattedAddress
    geometry: GoogleGeocodingGeometryDTO;
    place_id: string; // No C# é PlaceId
    types: string[];
}

/**
 * DTO para a resposta da API EONET da NASA (nível raiz).
 * Correspondente a: SeuProjetoNET.DTOs.Response.NasaEonetApiResponseDto
 * (convertidosCsemTxt.txt, source: 1314-1319)
 */
export interface NasaEonetApiResponseDTO {
    title: string;
    description: string;
    link: string;
    events: NasaEonetEventDTO[];
}

/**
 * DTO para uma categoria de evento EONET da NASA.
 * Correspondente a: SeuProjetoNET.DTOs.Response.NasaEonetCategoryDto
 * (convertidosCsemTxt.txt, source: 1319-1322)
 */
export interface NasaEonetCategoryDTO {
    id: string;
    title: string;
}

/**
 * DTO para um evento individual da API EONET da NASA.
 * Correspondente a: SeuProjetoNET.DTOs.Response.NasaEonetEventDto
 * (convertidosCsemTxt.txt, source: 1322-1330)
 */
export interface NasaEonetEventDTO {
    id: string;
    title: string;
    description?: string;
    link: string;
    closed?: string | null; // Adicionado baseado no uso no frontend (mapa-atuais/page.tsx)
    categories: NasaEonetCategoryDTO[];
    sources?: NasaEonetSourceDTO[];
    geometry: NasaEonetGeometryDTO[]; // No C# é `required List<NasaEonetGeometryDto> Geometry`
}

/**
 * DTO para a geometria de um evento EONET da NASA.
 * Correspondente a: SeuProjetoNET.DTOs.Response.NasaEonetGeometryDto
 * (convertidosCsemTxt.txt, source: 1330-1334)
 */
export interface NasaEonetGeometryDTO {
    magnitudeValue?: number; // Comum em alguns eventos, não no DTO C# mas pode vir da API
    magnitudeUnit?: string;  // Comum em alguns eventos, não no DTO C# mas pode vir da API
    date: string; // DateTimeOffset -> string ISO 8601
    type: string; // "Point", "Polygon", etc.
    coordinates: any; // Pode ser number[] para Point, number[][][] para Polygon, etc.
                      // O ideal seria um tipo mais específico se soubermos os formatos exatos:
                      // type: "Point", coordinates: [number, number] } | // longitude, latitude
                      // { type: "Polygon", coordinates: number[][][] }
}

/**
 * DTO para uma fonte de evento EONET da NASA.
 * Correspondente a: SeuProjetoNET.DTOs.Response.NasaEonetSourceDto
 * (convertidosCsemTxt.txt, source: 1334-1337)
 */
export interface NasaEonetSourceDTO {
    id: string;
    url: string;
}

/**
 * DTO para a resposta da API Nominatim (OpenStreetMap Geocoding).
 * Correspondente a: SeuProjetoNET.DTOs.Response.NominatimResponseDto
 * (convertidosCsemTxt.txt, source: 1337-1346)
 */
export interface NominatimResponseDTO {
    place_id: number; // C# long -> TypeScript number
    licence: string;
    osm_type: string;
    osm_id: number; // C# long -> TypeScript number
    lat: string; // Latitude como string
    lon: string; // Longitude como string
    display_name: string;
    boundingbox: string[];
    // A API Nominatim pode retornar muitos outros campos.
    // Adicionar aqui se necessário, por exemplo:
    // address?: {
    //   road?: string;
    //   city?: string;
    //   county?: string;
    //   state?: string;
    //   postcode?: string;
    //   country_code?: string;
    //   // ... e outros detalhes de endereço
    // };
}

/**
 * DTO para contagem de eventos ao longo do tempo.
 * Correspondente a: SeuProjetoNET.DTOs.Response.TimeCountDto
 * (convertidosCsemTxt.txt, source: 1346-1349)
 */
export interface TimeCountDTO { // Renomeado para consistência (DTO no final)
    timeLabel: string;
    count: number; // C# long -> TypeScript number
}

/**
 * DTO para a resposta da API ViaCEP.
 * Correspondente a: SeuProjetoNET.DTOs.Response.ViaCepResponseDto
 * (convertidosCsemTxt.txt, source: 1349-1361)
 */
export interface ViaCepResponseDTO {
    cep?: string;
    logradouro?: string;
    complemento?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    ibge?: string;
    gia?: string;
    ddd?: string;
    siafi?: string;
    erro?: boolean;
}

// Adicionando o tipo EventMapMarkerData que é usado no frontend (mapa/page.tsx)
// (convertidosTsxEmTxt.txt, source: 687, 952)
export interface EventMapMarkerData {
    id: string;
    position: [number, number]; // [latitude, longitude]
    popupText: string; // Conteúdo HTML para o popup
}