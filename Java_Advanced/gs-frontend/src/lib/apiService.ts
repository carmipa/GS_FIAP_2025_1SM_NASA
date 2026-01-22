import type {
    ClienteRequestDTO, ClienteResponseDTO,
    ContatoRequestDTO, ContatoResponseDTO,
    EnderecoRequestDTO, EnderecoResponseDTO,
    EnderecoGeoRequestDTO, GeoCoordinatesDTO,
    ViaCepResponseDTO, ApiErrorResponse, Page,
    EonetResponseDTO, NasaEonetEventDTO,
    CategoryCountDTO,
    UserAlertRequestDTO
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
console.log(`[apiService Módulo Load] API_BASE_URL inicializada como: "${API_BASE_URL}"`);

async function handleResponse<T>(response: Response, requestUrl: string): Promise<T> {
    const timestamp = new Date().toISOString();
    console.log(`[apiService][${timestamp}] handleResponse - URL: ${requestUrl}, Status HTTP: ${response.status}, OK: ${response.ok}`);

    if (!response.ok) {
        const errorPrefix = `[apiService][${timestamp}] ERRO na API para ${requestUrl}`;
        let errorPayload: Partial<ApiErrorResponse> | null = null;
        let errorTextMessage: string | null = null;
        const responseCloneForErrorParsing = response.clone();

        try {
            const contentType = response.headers.get("content-type");
            console.log(`${errorPrefix} - Content-Type da resposta de erro: ${contentType}`);
            if (contentType && contentType.includes("application/json")) {
                errorPayload = await response.json() as Partial<ApiErrorResponse>;
                console.log(`${errorPrefix} - Corpo do erro (JSON parseado):`, errorPayload);
            } else {
                errorTextMessage = await response.text();
                console.log(`${errorPrefix} - Corpo do erro (Texto puro):`, errorTextMessage);
            }
        } catch (e: unknown) {
            const parseErrorMessage = e instanceof Error ? e.message : String(e);
            console.warn(`${errorPrefix} - Falha ao parsear o corpo do erro. Tentando ler como texto. Erro do parse:`, parseErrorMessage);
            try {
                errorTextMessage = await responseCloneForErrorParsing.text();
                console.log(`${errorPrefix} - Texto do clone após falha:`, errorTextMessage);
            } catch (e2: unknown) {
                const parseCloneErrorMessage = e2 instanceof Error ? e2.message : String(e2);
                console.warn(`${errorPrefix} - Falha crítica ao ler o corpo do erro como texto do clone.`, parseCloneErrorMessage);
            }
        }

        let finalErrorMessage = `Erro ${response.status}: ${response.statusText || "Falha na requisição"}`;
        if (errorPayload && typeof errorPayload.message === 'string' && errorPayload.message.trim() !== '') {
            finalErrorMessage = errorPayload.message;
        } else if (errorPayload && Array.isArray(errorPayload.messages) && errorPayload.messages.length > 0) {
            finalErrorMessage = errorPayload.messages.join('; ');
        } else if (errorPayload && typeof errorPayload.error === 'string') {
            finalErrorMessage = `${errorPayload.error} (Status: ${errorPayload.status || response.status})`;
        } else if (errorTextMessage && errorTextMessage.trim() !== '') {
            finalErrorMessage = errorTextMessage.substring(0, 300);
        }

        console.error(`[apiService][${timestamp}] DETALHES DO ERRO FINAL: ${finalErrorMessage}`);
        throw new Error(finalErrorMessage);
    }

    if (response.status === 204) {
        console.log(`[apiService][${timestamp}] Resposta 204 (No Content) para ${requestUrl}. Retornando null.`);
        return null as T;
    }

    try {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            const jsonData = await response.json();
            const previewData = JSON.stringify(jsonData).substring(0, 300) + (JSON.stringify(jsonData).length > 300 ? "..." : "");
            console.log(`[apiService][${timestamp}] Resposta JSON OK para ${requestUrl}. Preview dos dados:`, previewData);
            return jsonData as T;
        } else {
            const textData = await response.text();
            console.log(`[apiService][${timestamp}] Resposta Texto OK para ${requestUrl}:`, textData.substring(0,300) + "...");
            return textData as unknown as T;
        }
    } catch (e: unknown) {
        const errorTimestamp = new Date().toISOString();
        const parseErrorMessage = e instanceof Error ? e.message : String(e);
        console.error(`[apiService][${errorTimestamp}] Erro CRÍTICO ao parsear resposta OK para ${requestUrl}. Erro:`, parseErrorMessage);
        let responseTextForDebug = "[Não foi possível ler o corpo da resposta como texto]";
        try {
            const responseClone = response.clone();
            responseTextForDebug = await responseClone.text();
        } catch {
            // Silencia o erro de leitura do corpo para depuração
        }
        console.error(`[apiService][${errorTimestamp}] Corpo da resposta que falhou no parse para ${requestUrl}:`, responseTextForDebug.substring(0, 500) + "...");
        throw new Error(`Falha ao processar a resposta JSON da API para ${requestUrl}. Detalhes: ${parseErrorMessage}`);
    }
}


// --- Cliente API ---
export async function listarClientes(page: number = 0, size: number = 10): Promise<Page<ClienteResponseDTO>> {
    const sortBy = 'nome';
    const direction = 'asc';
    const sortParam = `${sortBy},${direction}`;
    const requestUrl = `${API_BASE_URL}/clientes?page=${page}&size=${size}&sort=${sortParam}`;
    console.log(`[apiService] listarClientes - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl);
        return handleResponse<Page<ClienteResponseDTO>>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] listarClientes - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

export async function buscarClientePorId(id: number): Promise<ClienteResponseDTO> {
    const requestUrl = `${API_BASE_URL}/clientes/${id}`;
    console.log(`[apiService] buscarClientePorId - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl);
        return handleResponse<ClienteResponseDTO>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] buscarClientePorId - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

export async function buscarClientePorDocumento(documento: string): Promise<ClienteResponseDTO> {
    const cleanedDocumento = (documento || '').replace(/\D/g, '');
    const requestUrl = `${API_BASE_URL}/clientes/documento/${cleanedDocumento}`;
    console.log(`[apiService] buscarClientePorDocumento - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl);
        return handleResponse<ClienteResponseDTO>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] buscarClientePorDocumento - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

export async function criarCliente(data: ClienteRequestDTO): Promise<ClienteResponseDTO> {
    const payload = {...data, documento: (data.documento || '').replace(/\D/g, '') };
    const requestUrl = `${API_BASE_URL}/clientes`;
    console.log(`[apiService] criarCliente - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        return handleResponse<ClienteResponseDTO>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] criarCliente - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

export async function atualizarCliente(id: number, data: ClienteRequestDTO): Promise<ClienteResponseDTO> {
    const payload = {...data, documento: (data.documento || '').replace(/\D/g, '') };
    const requestUrl = `${API_BASE_URL}/clientes/${id}`;
    console.log(`[apiService] atualizarCliente - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        return handleResponse<ClienteResponseDTO>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] atualizarCliente - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

export async function deletarCliente(id: number): Promise<void> {
    const requestUrl = `${API_BASE_URL}/clientes/${id}`;
    console.log(`[apiService] deletarCliente - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl, { method: 'DELETE' });
        await handleResponse<void>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] deletarCliente - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

// --- Contato API ---
export async function criarContatoSozinho(data: ContatoRequestDTO): Promise<ContatoResponseDTO> {
    const requestUrl = `${API_BASE_URL}/contatos`;
    console.log(`[apiService] criarContatoSozinho - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        });
        return handleResponse<ContatoResponseDTO>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] criarContatoSozinho - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

// --- Endereco API ---
export async function consultarCepPelaApi(cep: string): Promise<ViaCepResponseDTO> {
    const cleanedCep = (cep || '').replace(/\D/g, '');
    const requestUrl = `${API_BASE_URL}/enderecos/consultar-cep/${cleanedCep}`;
    console.log(`[apiService] consultarCepPelaApi - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl);
        return handleResponse<ViaCepResponseDTO>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] consultarCepPelaApi - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

export async function calcularCoordenadasPelaApi(data: EnderecoGeoRequestDTO): Promise<GeoCoordinatesDTO> {
    const requestUrl = `${API_BASE_URL}/enderecos/calcular-coordenadas`;
    console.log(`[apiService] calcularCoordenadasPelaApi - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        });
        return handleResponse<GeoCoordinatesDTO>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] calcularCoordenadasPelaApi - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

export async function criarEnderecoSozinho(data: EnderecoRequestDTO): Promise<EnderecoResponseDTO> {
    const requestUrl = `${API_BASE_URL}/enderecos`;
    console.log(`[apiService] criarEnderecoSozinho - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        });
        return handleResponse<EnderecoResponseDTO>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] criarEnderecoSozinho - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

// --- Eonet API ---
export async function listarEventosEonet(page: number = 0, size: number = 10): Promise<Page<EonetResponseDTO>> {
    const requestUrl = `${API_BASE_URL}/eonet?page=${page}&size=${size}&sort=data,desc`;
    console.log(`[apiService] listarEventosEonet - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl);
        return handleResponse<Page<EonetResponseDTO>>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] listarEventosEonet - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

export async function buscarEventoLocalPorEonetApiId(eonetApiId: string): Promise<EonetResponseDTO> {
    const requestUrl = `${API_BASE_URL}/eonet/api-id/${eonetApiId}`;
    console.log(`[apiService] buscarEventoLocalPorEonetApiId - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl);
        return handleResponse<EonetResponseDTO>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] buscarEventoLocalPorEonetApiId - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

export async function sincronizarNasaEonet(limit?: number, days?: number, status?: string, source?: string): Promise<EonetResponseDTO[]> {
    const queryParamsCollector: Record<string, string> = {};
    if (limit !== undefined) queryParamsCollector.limit = String(limit);
    if (days !== undefined) queryParamsCollector.days = String(days);
    if (status) queryParamsCollector.status = status;
    if (source) queryParamsCollector.source = source;

    const params = new URLSearchParams(queryParamsCollector);
    const queryString = params.toString();
    const requestUrl = `${API_BASE_URL}/eonet/nasa/sincronizar${queryString ? '?' + queryString : ''}`;
    console.log(`[apiService] sincronizarNasaEonet - Chamando: ${requestUrl}`);

    try {
        const response = await fetch(requestUrl, { method: 'POST' });
        return handleResponse<EonetResponseDTO[]>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] sincronizarNasaEonet - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

export async function buscarEventosNasaProximos(
    latitude?: number, longitude?: number, raioKm?: number, limit?: number,
    days?: number, status?: string, source?: string, startDate?: string, endDate?: string,
    categoryId?: string
): Promise<NasaEonetEventDTO[]> {
    const queryParamsCollector: Record<string, string> = {};
    if (latitude !== undefined) queryParamsCollector.latitude = String(latitude);
    if (longitude !== undefined) queryParamsCollector.longitude = String(longitude);
    if (raioKm !== undefined) queryParamsCollector.raioKm = String(raioKm);
    if (limit !== undefined) queryParamsCollector.limit = String(limit);
    if (startDate) queryParamsCollector.start = startDate;
    if (endDate) queryParamsCollector.end = endDate;
    if (!startDate && !endDate && days !== undefined) { queryParamsCollector.days = String(days); }
    if (status !== undefined && status !== null) { queryParamsCollector.status = status; }
    if (source !== undefined && source !== null && source.trim() !== '') { queryParamsCollector.source = source; }

    if (categoryId && categoryId.trim() !== '') {
        queryParamsCollector.category = categoryId;
    }

    const params = new URLSearchParams(queryParamsCollector);
    const queryString = params.toString();
    const requestUrl = `${API_BASE_URL}/eonet/nasa/proximos${queryString ? '?' + queryString : ''}`;
    console.log(`[apiService] buscarEventosNasaProximos - Chamando: ${requestUrl}`);

    try {
        const response = await fetch(requestUrl);
        return handleResponse<NasaEonetEventDTO[]>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] buscarEventosNasaProximos - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

// --- Stats API ---
export async function getEonetCategoryStats(days: number): Promise<CategoryCountDTO[]> {
    if (days <= 0) {
        console.warn("[apiService] getEonetCategoryStats: 'days' deve ser um número positivo. Retornando array vazio.");
        return [];
    }
    const requestUrl = `${API_BASE_URL}/stats/eonet/count-by-category?days=${days}`;
    console.log(`[apiService] getEonetCategoryStats - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl);
        return handleResponse<CategoryCountDTO[]>(response, requestUrl);
    } catch (error) {
        console.error(`[apiService] getEonetCategoryStats - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}

// --- Alert API ---
export async function triggerUserSpecificAlert(data: UserAlertRequestDTO): Promise<string> {
    const requestUrl = `${API_BASE_URL}/alerts/trigger-user-specific-alert`;
    console.log(`[apiService] triggerUserSpecificAlert - Chamando: ${requestUrl}`);
    try {
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorPrefix = `[apiService] Erro na API para ${requestUrl}`;
            let errorMessage = `Falha ao disparar alerta (Status: ${response.status})`;
            try {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorJson: Partial<ApiErrorResponse> = await response.json();
                    console.log(`${errorPrefix} - Corpo do erro (JSON):`, errorJson);
                    if (Array.isArray(errorJson.messages) && errorJson.messages.length > 0) {
                        errorMessage = errorJson.messages.join('; ');
                    } else if (errorJson.message && typeof errorJson.message === 'string') {
                        errorMessage = errorJson.message;
                    } else if (errorJson.error && typeof errorJson.error === 'string' && errorJson.status) {
                        errorMessage = `${errorJson.error} (Status: ${errorJson.status})`;
                    }
                } else {
                    const errorText = await response.text();
                    console.log(`${errorPrefix} - Corpo do erro (Texto):`, errorText);
                    if (errorText) errorMessage = errorText;
                }
            } catch (e: unknown) {
                const parseErrorMessage = e instanceof Error ? e.message : String(e);
                console.error(`${errorPrefix} - Erro ao processar resposta de erro da API:`, parseErrorMessage);
            }
            console.error(`[apiService] API Error (triggerUserSpecificAlert): ${errorMessage}`);
            throw new Error(errorMessage);
        }
        const successText = await response.text();
        console.log(`[apiService] triggerUserSpecificAlert - Resposta Texto OK para ${requestUrl}:`, successText);
        return successText;
    } catch (error) {
        console.error(`[apiService] triggerUserSpecificAlert - Erro no fetch para ${requestUrl}:`, error);
        throw error;
    }
}