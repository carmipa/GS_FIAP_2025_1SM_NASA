// --- Tipos para Paginação (Existente) ---
export interface Page<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// --- Tipos de Contato (Existente) ---
export interface ContatoRequestDTO {
  ddd: string;
  telefone: string;
  celular?: string;
  whatsapp?: string;
  email: string;
  tipoContato: string;
}

export interface ContatoResponseDTO extends ContatoRequestDTO {
  idContato: number;
}

// --- Tipos de Endereço (Existente) ---
export interface EnderecoRequestDTO {
  cep: string;
  numero: number; // A API espera number, o formulário pode lidar com string e converter
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  complemento?: string;
  latitude: number;
  longitude: number;
}

export interface EnderecoResponseDTO extends EnderecoRequestDTO {
  idEndereco: number;
}

// --- Tipos de Cliente (Existente) ---
export interface ClienteRequestDTO {
  nome: string;
  sobrenome: string;
  dataNascimento: string; // Formato YYYY-MM-DD esperado pela API
  documento: string;
  contatosIds?: number[];
  enderecosIds?: number[];
}

export interface ClienteResponseDTO {
  idCliente: number;
  nome: string;
  sobrenome: string;
  dataNascimento: string;
  documento: string;
  contatos?: ContatoResponseDTO[]; // Pode ser Set<ContatoResponseDTO> dependendo do backend
  enderecos?: EnderecoResponseDTO[]; // Pode ser Set<EnderecoResponseDTO> dependendo do backend
}

// --- Tipos de API Externas e Utilitários (Existente) ---
export interface ViaCepResponseDTO {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error?: string;
  message: string;
  messages?: string[];
  path?: string;
  details?: string[] | string;
}

export interface EnderecoGeoRequestDTO {
  logradouro: string;
  numero?: number | string; // Permitir string do formulário, converter para número antes de enviar se a API externa exigir
  cidade: string;
  uf: string;
  bairro?: string;
  cep?: string;
}

export interface GeoCoordinatesDTO {
  latitude: number;
  longitude: number;
  matchedAddress?: string;
}

// --- Tipos para EONET (Backend Local - Existente) ---
export interface EonetResponseDTO {
  idEonet: number;
  json: string; // O JSON string dos detalhes do evento da NASA EONET
  data?: string | Date; // Data de quando o evento ocorreu ou foi registrado
  eonetIdApi: string; // O ID original do evento na API EONET
}

// --- Tipos para NASA EONET Events (Existente) ---
export interface NasaEonetCategoryDTO {
  id: string;
  title: string;
}

export interface NasaEonetSourceDTO {
  id: string;
  url: string;
}

export interface NasaEonetGeometryDTO {
  magnitudeValue?: number;
  magnitudeUnit?: string;
  date: string | Date;
  type: "Point" | "Polygon" | string; // Outros tipos de geometria GeoJSON são possíveis
  coordinates: [number, number] | Array<[number, number]> | Array<Array<[number, number]>> | Array<Array<Array<[number, number]>>>;
  // Esta união cobre:
  // Point: [lon, lat]
  // LineString / MultiPoint: Array<[lon, lat]>
  // Polygon (com 1 anel) / MultiLineString: Array<Array<[lon, lat]>> (o array externo tem o(s) anel(is))
  // Polygon (com múltiplos anéis) / MultiPolygon: Array<Array<Array<[lon, lat]>>>
}

export interface NasaEonetEventDTO {
  id: string;
  title: string;
  description?: string;
  link: string;
  categories: NasaEonetCategoryDTO[];
  sources: NasaEonetSourceDTO[];
  geometry: NasaEonetGeometryDTO[]; // Pode ser um array se o evento tiver múltiplas geometrias
  closed?: string | Date | null; // Data em que o evento foi fechado
}

// ***** NOVA INTERFACE PARA DADOS DE ESTATÍSTICAS *****
export interface CategoryCountDTO {
  categoryTitle: string;
  count: number;
}

export interface AlertableEventDTO {
  eventId?: string;
  title?: string;
  eventDate?: string;
  link?: string;
  description?: string;
}

export interface UserAlertRequestDTO {
  userId: number;
  eventDetails: AlertableEventDTO;
}
// ***** FIM DA NOVA INTERFACE *****