// src/lib/apiService.ts

import type {
    Page,
    ClienteResponseDTO,
    ClienteRequestDTO,
    ContatoRequestDTO,
    ContatoResponseDTO,
    EnderecoRequestDTO,
    EnderecoResponseDTO,
    EnderecoGeoRequestDTO,
    GeoCoordinatesDTO,
    ViaCepResponseDTO,
    EonetResponseDTO,
    NasaEonetEventDTO,
    UserAlertRequestDTO,
    CategoryCountDTO,
    // Adicione quaisquer outros tipos que possam ser diretamente retornados ou enviados aqui
} from './types';

// TODO: AJUSTE ESTA URL PARA O ENDEREÇO DO SEU BACKEND C#
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5175/api';
// ...

/**
 * Função auxiliar para tratar as respostas da API.
 * @param response A resposta do fetch.
 * @returns Uma Promise com os dados JSON ou lança um erro.
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorMessage = `Erro HTTP: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            // Tenta extrair mensagens de erro mais detalhadas do backend C# (TratadorGlobalExcecoesMiddleware)
            if (errorData && errorData.message) {
                errorMessage = errorData.message;
            } else if (errorData && errorData.title) { // Para erros de validação do ASP.NET Core
                errorMessage = errorData.title;
                if (errorData.errors) {
                    const validationErrors = Object.values(errorData.errors).flat().join(', ');
                    errorMessage += `: ${validationErrors}`;
                }
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        } catch (e) {
            // Se não conseguir parsear o JSON do erro, usa a mensagem HTTP padrão
        }
        throw new Error(errorMessage);
    }
    // Se a resposta for 204 No Content, não há corpo para parsear
    if (response.status === 204) {
        return null as T; // Ou undefined, dependendo de como você quer tratar
    }
    return response.json() as Promise<T>;
}

// --- Clientes ---

export async function listarClientes(page: number = 0, size: number = 10, sortBy: string = 'nome'): Promise<Page<ClienteResponseDTO>> {
    // No C#, pageNumber geralmente começa em 1. O frontend usa page começando em 0.
    const pageNumber = page + 1;
    const response = await fetch(`${API_BASE_URL}/clientes?pageNumber=${pageNumber}&pageSize=${size}&sortBy=${sortBy}`);
    return handleApiResponse<Page<ClienteResponseDTO>>(response);
}

export async function buscarClientePorId(id: number): Promise<ClienteResponseDTO> {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`);
    return handleApiResponse<ClienteResponseDTO>(response);
}

// Assumindo um endpoint /api/clientes/documento/{documento} no C#
export async function buscarClientePorDocumento(documento: string): Promise<ClienteResponseDTO> {
    const response = await fetch(`${API_BASE_URL}/clientes/documento/${documento}`);
    return handleApiResponse<ClienteResponseDTO>(response);
}

export async function criarCliente(clienteData: ClienteRequestDTO): Promise<ClienteResponseDTO> {
    const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteData),
    });
    return handleApiResponse<ClienteResponseDTO>(response);
}

export async function atualizarCliente(id: number, clienteData: ClienteRequestDTO): Promise<ClienteResponseDTO> {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteData),
    });
    return handleApiResponse<ClienteResponseDTO>(response);
}

export async function deletarCliente(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
        method: 'DELETE',
    });
    // Retorna null ou void para 204 No Content
    return handleApiResponse<void>(response);
}

// --- Contatos ---

export async function criarContatoSozinho(contatoData: ContatoRequestDTO): Promise<ContatoResponseDTO> {
    const response = await fetch(`${API_BASE_URL}/contatos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contatoData),
    });
    return handleApiResponse<ContatoResponseDTO>(response);
}

/**
 * ATUALIZADO: Função para atualizar um contato existente.
 */
export async function atualizarContato(id: number, contatoData: ContatoRequestDTO): Promise<ContatoResponseDTO> {
    const response = await fetch(`${API_BASE_URL}/contatos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contatoData),
    });
    return handleApiResponse<ContatoResponseDTO>(response);
}

// export async function deletarContatoSozinho(id: number): Promise<void> { ... }


// --- Endereços ---

export async function criarEnderecoSozinho(enderecoData: EnderecoRequestDTO): Promise<EnderecoResponseDTO> {
    const response = await fetch(`${API_BASE_URL}/enderecos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enderecoData),
    });
    return handleApiResponse<EnderecoResponseDTO>(response);
}

/**
 * ATUALIZADO: Função para atualizar um endereço existente.
 */
export async function atualizarEndereco(id: number, enderecoData: EnderecoRequestDTO): Promise<EnderecoResponseDTO> {
    const response = await fetch(`${API_BASE_URL}/enderecos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enderecoData),
    });
    return handleApiResponse<EnderecoResponseDTO>(response);
}

// Se precisar de deletarEnderecoSozinho, adicione similarmente.

export async function consultarCepPelaApi(cep: string): Promise<ViaCepResponseDTO> {
    // O backend C# encapsula a chamada ao ViaCEP
    const response = await fetch(`${API_BASE_URL}/enderecos/consultar-cep/${cep}`);
    return handleApiResponse<ViaCepResponseDTO>(response);
}

export async function calcularCoordenadasPelaApi(geoRequestData: EnderecoGeoRequestDTO): Promise<GeoCoordinatesDTO> {
    // O backend C# encapsula a chamada ao serviço de Geocoding
    const response = await fetch(`${API_BASE_URL}/enderecos/calcular-coordenadas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geoRequestData),
    });
    return handleApiResponse<GeoCoordinatesDTO>(response);
}

// --- EONET (Eventos de Desastres) ---

export async function listarEventosEonet(page: number = 0, size: number = 10, sortBy: string = 'data', sortDirection: string = 'desc'): Promise<Page<EonetResponseDTO>> {
    const pageNumber = page + 1; // Ajuste para C#
    const response = await fetch(`${API_BASE_URL}/eonet?pageNumber=${pageNumber}&pageSize=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`);
    return handleApiResponse<Page<EonetResponseDTO>>(response);
}

export async function buscarEventoLocalPorEonetApiId(eonetApiId: string): Promise<EonetResponseDTO> {
    const response = await fetch(`${API_BASE_URL}/eonet/api-id/${eonetApiId}`);
    return handleApiResponse<EonetResponseDTO>(response);
}

export async function sincronizarNasaEonet(limit?: number, days?: number, status?: string, source?: string): Promise<EonetResponseDTO[]> {
    let queryString = '?';
    if (limit !== undefined) queryString += `limit=${limit}&`;
    if (days !== undefined) queryString += `days=${days}&`;
    if (status !== undefined) queryString += `status=${status}&`;
    if (source !== undefined) queryString += `source=${source}&`;
    // Remove o último '&' ou '?' se não houver parâmetros
    queryString = queryString.length > 1 ? queryString.slice(0, -1) : '';

    const response = await fetch(`${API_BASE_URL}/eonet/nasa/sincronizar${queryString}`, {
        method: 'POST',
    });
    return handleApiResponse<EonetResponseDTO[]>(response);
}

export async function buscarEventosNasaProximos(
    latitude?: number,
    longitude?: number,
    raioKm?: number,
    limit?: number,
    days?: number,
    status?: string,
    source?: string,
    startDate?: string, // Adicionado para compatibilidade com a chamada no frontend
    endDate?: string    // Adicionado para compatibilidade com a chamada no frontend
): Promise<NasaEonetEventDTO[]> {
    const params = new URLSearchParams();
    if (latitude !== undefined) params.append('latitude', latitude.toString());
    if (longitude !== undefined) params.append('longitude', longitude.toString());
    if (raioKm !== undefined) params.append('raioKm', raioKm.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    if (days !== undefined) params.append('days', days.toString());
    if (status !== undefined && status !== '') params.append('status', status);
    if (source !== undefined && source !== '') params.append('source', source);
    if (startDate !== undefined && startDate !== '') params.append('startDate', startDate);
    if (endDate !== undefined && endDate !== '') params.append('endDate', endDate);

    const queryString = params.toString();
    const response = await fetch(`${API_BASE_URL}/eonet/nasa/proximos${queryString ? `?${queryString}` : ''}`);
    return handleApiResponse<NasaEonetEventDTO[]>(response);
}

// --- Alertas ---

export async function triggerUserSpecificAlert(alertData: UserAlertRequestDTO): Promise<string> { // A API C# retorna string
    const response = await fetch(`${API_BASE_URL}/alerts/trigger-user-specific-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
    });

    if (!response.ok) {
        // tratamento de erro similar ao handleApiResponse mas para texto/string
        const errorText = await response.text();
        throw new Error(errorText || `Erro HTTP: ${response.status}`);
    }
    if (response.status === 204) return "Solicitação processada sem conteúdo.";
    // Se a API C# retorna uma string diretamente no corpo (não JSON)
    const successText = await response.text();
    return successText;
}

// --- Estatísticas ---

export async function getEonetCategoryStats(days: number = 365): Promise<CategoryCountDTO[]> {
    const response = await fetch(`${API_BASE_URL}/stats/eonet/count-by-category?days=${days}`);
    return handleApiResponse<CategoryCountDTO[]>(response);
}