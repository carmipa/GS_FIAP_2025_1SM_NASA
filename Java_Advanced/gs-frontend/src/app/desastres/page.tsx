'use client';

import React, { useEffect, useState, FormEvent, useRef, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import {
    listarEventosEonet,
    sincronizarNasaEonet,
    buscarEventosNasaProximos,
    buscarClientePorId,
    triggerUserSpecificAlert,
    buscarEventoLocalPorEonetApiId
} from '@/lib/apiService';
import type {
    EonetResponseDTO,
    Page,
    NasaEonetEventDTO,
    NasaEonetCategoryDTO,
    NasaEonetGeometryDTO,
    ClienteResponseDTO,
    UserAlertRequestDTO
} from '@/lib/types';

import type { EventMapMarkerData } from '@/components/EonetEventMap';

type UsuarioResponseDTO = ClienteResponseDTO;

const DynamicEonetEventMap = dynamic(() => import('@/components/EonetEventMap'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center w-full h-full bg-slate-100/80 rounded-md" style={{minHeight: '200px'}}>
            <p className="text-center text-slate-600 py-2 text-sm">Carregando mapa...</p>
        </div>
    ),
});

const parseEonetEventJson = (jsonString: string): Partial<NasaEonetEventDTO> | null => {
    try {
        return JSON.parse(jsonString) as Partial<NasaEonetEventDTO>;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Erro ao parsear JSON do evento EONET:", message, jsonString);
        return null;
    }
};

const getCoordinatesFromEvent = (geometry: NasaEonetGeometryDTO[] | undefined): [number, number] | null => {
    if (!geometry || geometry.length === 0) return null;
    const pointGeometry = geometry.find(geom => geom.type === "Point");
    if (pointGeometry && Array.isArray(pointGeometry.coordinates) && pointGeometry.coordinates.length === 2) {
        return [pointGeometry.coordinates[1] as number, pointGeometry.coordinates[0] as number];
    }
    const firstGeom = geometry[0];
    if (firstGeom && Array.isArray(firstGeom.coordinates)) {
        if (firstGeom.type === "Polygon" &&
            Array.isArray(firstGeom.coordinates[0]) &&
            Array.isArray(firstGeom.coordinates[0][0]) &&
            firstGeom.coordinates[0][0].length === 2
        ) {
            return [firstGeom.coordinates[0][0][1] as number, firstGeom.coordinates[0][0][0] as number];
        }
    }
    return null;
};

const formatDate = (dateString?: string | Date): string => {
    if (!dateString) return 'N/A';
    try { 
        return new Date(dateString).toLocaleDateString('pt-BR', { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit', timeZone: 'UTC' 
        });
    } catch { return 'Data inválida'; }
};

type TabKey = 'sincronizar' | 'listarLocais' | 'buscarProximos' | 'alertarUsuario';

export default function DesastresPage() {
    const [activeTab, setActiveTab] = useState<TabKey>('sincronizar');
    const [eventosLocaisPage, setEventosLocaisPage] = useState<Page<EonetResponseDTO> | null>(null);
    const [erroListagemLocal, setErroListagemLocal] = useState<string | null>(null);
    const [loadingListagemLocal, setLoadingListagemLocal] = useState<boolean>(false);
    const [currentLocalPage, setCurrentLocalPage] = useState<number>(0);

    const [syncParams, setSyncParams] = useState({ limit: '20', days: '7', status: 'open', source: '' });
    const [loadingSync, setLoadingSync] = useState<boolean>(false);
    const [syncMensagem, setSyncMensagem] = useState<string | null>(null);
    const [syncErro, setSyncErro] = useState<string | null>(null);

    const [proximidadeParams, setProximidadeParams] = useState({
        clienteId: '', latitude: '', longitude: '', raioKm: '100',
        limit: '10', days: '30', status: 'open', source: ''
    });
    const [eventosProximos, setEventosProximos] = useState<NasaEonetEventDTO[]>([]);
    const [loadingProximidade, setLoadingProximidade] = useState<boolean>(false);
    const [erroProximidade, setErroProximidade] = useState<string | null>(null);
    const [nomeUsuarioParaCoords, setNomeUsuarioParaCoords] = useState<string | null>(null);
    const [mensagemAlertaProximidade, setMensagemAlertaProximidade] = useState<string | null>(null);
    const [erroAlertaProximidade, setErroAlertaProximidade] = useState<string | null>(null);

    const [alertarUsuarioParams, setAlertarUsuarioParams] = useState({ usuarioId: '', eventoEonetId: '' });
    const [verifiedUsuario, setVerifiedUsuario] = useState<UsuarioResponseDTO | null>(null);
    const [verifiedEvento, setVerifiedEvento] = useState<Partial<NasaEonetEventDTO> | null>(null);
    const [loadingAlertarUsuario, setLoadingAlertarUsuario] = useState<boolean>(false);
    const [loadingVerifyUsuario, setLoadingVerifyUsuario] = useState<boolean>(false);
    const [loadingVerifyEvento, setLoadingVerifyEvento] = useState<boolean>(false);
    const [mensagemAlertarUsuario, setMensagemAlertarUsuario] = useState<string | null>(null);
    const [erroAlertarUsuario, setErroAlertarUsuario] = useState<string | null>(null);

    const usuarioIdRef = useRef<HTMLInputElement>(null);
    const alertarUsuarioIdInputRef = useRef<HTMLInputElement>(null);

    const fetchEventosLocais = async (page: number) => {
        setLoadingListagemLocal(true);
        setErroListagemLocal(null);
        try {
            const data = await listarEventosEonet(page, 5);
            setEventosLocaisPage(data);
        } catch (error: unknown) {
            let errorMessage = 'Erro desconhecido ao carregar eventos locais.';
            if (error instanceof Error) {
                errorMessage = error.message || errorMessage;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            setErroListagemLocal(`Falha ao carregar eventos locais: ${errorMessage}`);
            setEventosLocaisPage(null);
        } finally {
            setLoadingListagemLocal(false);
        }
    };

    useEffect(() => {
        setSyncMensagem(null); setSyncErro(null);
        if (erroProximidade && !(erroProximidade.includes("Usuário") || erroProximidade.includes("ID de Usuário") || erroProximidade.includes("coordenadas"))) {
            setErroProximidade(null);
        }
        setMensagemAlertaProximidade(null); setErroAlertaProximidade(null);
        setMensagemAlertarUsuario(null); setErroAlertarUsuario(null);

        if (activeTab !== 'alertarUsuario') {
            setAlertarUsuarioParams({ usuarioId: '', eventoEonetId: '' });
            setVerifiedUsuario(null);
            setVerifiedEvento(null);
        }
        if (activeTab !== 'buscarProximos' && !proximidadeParams.clienteId) {
            setNomeUsuarioParaCoords(null);
        }

        if (activeTab === 'listarLocais') {
            fetchEventosLocais(currentLocalPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'listarLocais') {
            fetchEventosLocais(currentLocalPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLocalPage]);

    const handleSyncParamChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSyncParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSincronizar = async (e: FormEvent) => {
        e.preventDefault(); setLoadingSync(true);
        setSyncMensagem("Sincronizando com a NASA EONET..."); setSyncErro(null);
        const limitNum = syncParams.limit ? parseInt(syncParams.limit, 10) : undefined;
        const daysNum = syncParams.days ? parseInt(syncParams.days, 10) : undefined;
        try {
            const eventosSincronizados = await sincronizarNasaEonet(limitNum, daysNum, syncParams.status || undefined, syncParams.source || undefined);
            setSyncMensagem(`${eventosSincronizados.length} evento(s) processado(s) / sincronizado(s) com sucesso!`);
             if (activeTab === 'listarLocais') { 
                 fetchEventosLocais(0); 
                 setCurrentLocalPage(0);
            }
        } catch (error: unknown) { 
            let errorMessage = 'Erro desconhecido na sincronização.';
            if (error instanceof Error) {
                errorMessage = error.message || errorMessage;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            setSyncErro(`Falha na sincronização: ${errorMessage}`);
            setSyncMensagem(null);
        } finally { setLoadingSync(false); }
    };

    const handleProximidadeParamChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProximidadeParams(prev => ({ ...prev, [name]: value }));
        if (name === 'clienteId') {
            setNomeUsuarioParaCoords(null);
            if (erroProximidade && (erroProximidade.includes("Usuário") || erroProximidade.includes("ID de Usuário") || erroProximidade.includes("coordenadas"))) {
                setErroProximidade(null);
            }
            if (value === '') {
                setProximidadeParams(prev => ({ ...prev, latitude: '', longitude: '' }));
            }
        }
    };

    const buscarCoordenadasCliente = async () => {
        if (!proximidadeParams.clienteId) {
            setErroProximidade("Informe um ID de Usuário para buscar suas coordenadas.");
            setNomeUsuarioParaCoords(null); if (usuarioIdRef.current) usuarioIdRef.current.focus(); return;
        }
        setLoadingProximidade(true); setErroProximidade(null); setNomeUsuarioParaCoords(null);
        try {
            const usuario: ClienteResponseDTO = await buscarClientePorId(Number(proximidadeParams.clienteId));
            const enderecosArray = usuario.enderecos ? Array.from(usuario.enderecos) : [];
            if (enderecosArray.length > 0 && enderecosArray[0] &&
                typeof enderecosArray[0].latitude === 'number' && typeof enderecosArray[0].longitude === 'number' &&
                (enderecosArray[0].latitude !== 0 || enderecosArray[0].longitude !== 0)
            ) {
                const end = enderecosArray[0];
                setProximidadeParams(prev => ({ ...prev, latitude: String(end.latitude), longitude: String(end.longitude) }));
                setNomeUsuarioParaCoords(`${usuario.nome} ${usuario.sobrenome || ''}`.trim());
            } else {
                setErroProximidade(`Usuário ID ${proximidadeParams.clienteId} (${usuario.nome}) encontrado, mas não possui endereço principal com coordenadas válidas.`);
                setProximidadeParams(prev => ({ ...prev, latitude: '', longitude: '' }));
            }
        } catch (error: unknown) {
            let errorMessage = 'Erro desconhecido ao buscar dados do usuário.';
            if (error instanceof Error) {
                errorMessage = error.message || errorMessage;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            setErroProximidade(`Falha ao buscar dados do usuário (ID: ${proximidadeParams.clienteId}): ${errorMessage}`);
            setProximidadeParams(prev => ({ ...prev, latitude: '', longitude: '' }));
        } finally { setLoadingProximidade(false); }
    };

    const handleBuscarProximidade = async (e: FormEvent) => {
        e.preventDefault();
        if (erroProximidade && !(erroProximidade.includes("Usuário") || erroProximidade.includes("ID de Usuário") || erroProximidade.includes("coordenadas"))) {
            setErroProximidade(null);
        }
        setMensagemAlertaProximidade(null);
        setErroAlertaProximidade(null);

        if (!proximidadeParams.latitude || !proximidadeParams.longitude) {
            setErroProximidade("Latitude e Longitude são obrigatórias para busca por proximidade."); return;
        }
        if (!proximidadeParams.raioKm || Number(proximidadeParams.raioKm) <= 0) {
            setErroProximidade("Raio em KM é obrigatório e deve ser positivo."); return;
        }

        setLoadingProximidade(true); setEventosProximos([]);
        try {
            const eventosRecebidos = await buscarEventosNasaProximos(
                parseFloat(proximidadeParams.latitude), parseFloat(proximidadeParams.longitude),
                parseFloat(proximidadeParams.raioKm),
                proximidadeParams.limit ? parseInt(proximidadeParams.limit, 10) : undefined,
                proximidadeParams.days ? parseInt(proximidadeParams.days, 10) : undefined,
                proximidadeParams.status || undefined, proximidadeParams.source || undefined,
                undefined, undefined, undefined
            );
            setEventosProximos(eventosRecebidos || []);

            if (!eventosRecebidos || eventosRecebidos.length === 0) {
                if (!(erroProximidade && (erroProximidade.includes("Usuário") || erroProximidade.includes("ID de Usuário") || erroProximidade.includes("coordenadas")))) {
                    setErroProximidade("Nenhum evento encontrado na API da NASA para os critérios de proximidade informados.");
                }
            } else {
                if (erroProximidade && !(erroProximidade.includes("Usuário") || erroProximidade.includes("ID de Usuário") || erroProximidade.includes("coordenadas"))) {
                    setErroProximidade(null);
                }
                if (proximidadeParams.clienteId && nomeUsuarioParaCoords) {
                    const eventoPrincipal = eventosRecebidos[0];
                    const dataEvento = eventoPrincipal.geometry?.[0]?.date;
                    const alertaPayload: UserAlertRequestDTO = {
                        userId: Number(proximidadeParams.clienteId),
                        eventDetails: {
                            eventId: eventoPrincipal.id, title: eventoPrincipal.title,
                            eventDate: dataEvento ? new Date(dataEvento).toISOString() : "Data não disponível",
                            link: eventoPrincipal.link,
                            description: eventoPrincipal.description || `Um evento "${eventoPrincipal.title}" foi detectado próximo à área de ${nomeUsuarioParaCoords} em ${formatDate(dataEvento?.toString())}.`,
                        }
                    };
                    try {
                        const alertResponseMsg = await triggerUserSpecificAlert(alertaPayload);
                        setMensagemAlertaProximidade(alertResponseMsg || "Alerta sobre evento próximo foi processado.");
                    } catch (errAlerta: unknown) {
                        let errorMessage = "Não foi possível processar o envio do alerta no momento.";
                        if (errAlerta instanceof Error) {
                            errorMessage = errAlerta.message || errorMessage;
                        } else if (typeof errAlerta === 'string') {
                            errorMessage = errAlerta;
                        }
                        setErroAlertaProximidade(errorMessage);
                    }
                }
            }
        } catch (error: unknown) {
            let errorMessage = 'Erro desconhecido ao buscar eventos próximos.';
            if (error instanceof Error) {
                errorMessage = error.message || errorMessage;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            setErroProximidade(`Falha ao buscar eventos próximos: ${errorMessage}`);
        } finally { setLoadingProximidade(false); }
    };

    const handleAlertarUsuarioParamChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAlertarUsuarioParams(prev => ({ ...prev, [name]: value }));
        if (name === 'usuarioId') { setVerifiedUsuario(null); if(erroAlertarUsuario && erroAlertarUsuario.includes("Usuário")) setErroAlertarUsuario(null); }
        if (name === 'eventoEonetId') { setVerifiedEvento(null); if(erroAlertarUsuario && erroAlertarUsuario.includes("Evento")) setErroAlertarUsuario(null); }
        setMensagemAlertarUsuario(null);
        if (erroAlertarUsuario) setErroAlertarUsuario(null);
    };

    const handleVerificarUsuario = async () => {
        if (!alertarUsuarioParams.usuarioId) {
            setErroAlertarUsuario("Por favor, insira um ID de Usuário para verificar.");
            setVerifiedUsuario(null); return;
        }
        setLoadingVerifyUsuario(true); setErroAlertarUsuario(null); setVerifiedUsuario(null);
        try {
            const usuario = await buscarClientePorId(Number(alertarUsuarioParams.usuarioId));
            setVerifiedUsuario(usuario);
            setErroAlertarUsuario(null);
        } catch (error: unknown) {
            let errorMessage = `Erro ao buscar usuário ID ${alertarUsuarioParams.usuarioId}.`;
            if (error instanceof Error) {
                errorMessage = error.message || errorMessage;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            setErroAlertarUsuario(errorMessage);
            setVerifiedUsuario(null);
        } finally { setLoadingVerifyUsuario(false); }
    };

    const handleVerificarEvento = async () => {
        if (!alertarUsuarioParams.eventoEonetId) {
            setErroAlertarUsuario("Por favor, insira um ID de Evento EONET para verificar.");
            setVerifiedEvento(null); return;
        }
        setLoadingVerifyEvento(true); setErroAlertarUsuario(null); setVerifiedEvento(null);
        try {
            const eventoLocal = await buscarEventoLocalPorEonetApiId(alertarUsuarioParams.eventoEonetId);
            const eventoNasaDetails = parseEonetEventJson(eventoLocal.json);
            if (eventoNasaDetails) {
                if (!eventoNasaDetails.id && eventoLocal.eonetIdApi) eventoNasaDetails.id = eventoLocal.eonetIdApi;
                setVerifiedEvento(eventoNasaDetails);
                setErroAlertarUsuario(null);
            }
            else { throw new Error("Não foi possível interpretar os detalhes do evento EONET."); }
        } catch (error: unknown) {
            let errorMessage = `Erro ao buscar evento EONET ID ${alertarUsuarioParams.eventoEonetId}. Verifique se o evento foi sincronizado.`;
            if (error instanceof Error) {
                errorMessage = error.message || errorMessage;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            setErroAlertarUsuario(errorMessage);
            setVerifiedEvento(null);
        } finally { setLoadingVerifyEvento(false); }
    };

    const handleAlertarUsuarioSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!verifiedUsuario || !verifiedEvento) {
            setErroAlertarUsuario("Verifique o Usuário e o Evento antes de enviar o alerta. Clique nos botões 'Verificar'.");
            return;
        }
        setLoadingAlertarUsuario(true); setMensagemAlertarUsuario(null); setErroAlertarUsuario(null);
        try {
            const dataEvento = verifiedEvento.geometry?.[0]?.date;
            const alertaPayload: UserAlertRequestDTO = {
                userId: Number(alertarUsuarioParams.usuarioId),
                eventDetails: {
                    eventId: verifiedEvento.id || alertarUsuarioParams.eventoEonetId,
                    title: verifiedEvento.title || "Evento EONET",
                    eventDate: dataEvento ? new Date(dataEvento).toISOString() : "Data não disponível",
                    link: verifiedEvento.link || "",
                    description: verifiedEvento.description || `Alerta: Um evento (${verifiedEvento.title || 'N/A'}) requer sua atenção.`
                }
            };
            const alertResponseMsg = await triggerUserSpecificAlert(alertaPayload);
            setMensagemAlertarUsuario(alertResponseMsg || `Alerta sobre o evento "${alertaPayload.eventDetails.title}" foi processado para o usuário ${verifiedUsuario.nome}.`);
        } catch (error: unknown) {
            let errorMessage = "Não foi possível processar o envio do alerta específico.";
            if (error instanceof Error) {
                errorMessage = error.message || errorMessage;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            setErroAlertarUsuario(errorMessage);
        } finally { setLoadingAlertarUsuario(false); }
    };

    const renderEventoItem = (evento: NasaEonetEventDTO | Partial<NasaEonetEventDTO>) => {
        const dataEvento = evento?.geometry?.[0]?.date;
        const categorias = evento?.categories?.map((cat: NasaEonetCategoryDTO) => cat.title).join(', ') || 'N/A';
        return (
            <div className="client-info-section" style={{flex: 1}}>
                <strong>{evento?.title || 'Título não disponível'}</strong>
                {evento?.id && <p><span className="label">ID NASA:</span> {evento.id}</p>}
                <p><span className="label">Data do Evento:</span> {formatDate(dataEvento?.toString())}</p>
                <p><span className="label">Categorias:</span> {categorias}</p>
                {evento?.link && (<p><span className="label">Fonte:</span> <a href={evento.link} target="_blank" rel="noopener noreferrer" style={{color: 'var(--link-color)', pointerEvents: 'auto'}}>Ver na NASA EONET</a></p>)}
            </div>
        );
    };

    const tabButtonStyle = (tabKey: TabKey): React.CSSProperties => ({
        padding: '10px 20px', cursor: 'pointer', border: '1px solid transparent',
        borderBottomColor: activeTab === tabKey ? 'var(--white-bg, #fff)' : 'var(--border-color, #ccc)',
        backgroundColor: activeTab === tabKey ? 'var(--white-bg, #fff)' : 'var(--light-gray-bg, #f0f0f0)',
        fontWeight: activeTab === tabKey ? '600' : '500', marginRight: '5px',
        borderTopLeftRadius: 'var(--card-border-radius, 6px)', borderTopRightRadius: 'var(--card-border-radius, 6px)',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: activeTab === tabKey ? 'var(--primary-color, blue)' : 'var(--text-color, black)',
        position: 'relative', bottom: '-1px', zIndex: activeTab === tabKey ? 2 : 1,
    });

    const tabContentStyle: React.CSSProperties = {
        border: '1px solid var(--border-color, #ccc)', padding: '20px',
        borderRadius: '0 var(--card-border-radius, 6px) var(--card-border-radius, 6px) var(--card-border-radius, 6px)',
        backgroundColor: 'var(--white-bg, #fff)', marginTop: '-1px', boxShadow: 'var(--card-shadow, 0 1px 3px rgba(0,0,0,0.1))',
        minHeight: '400px',
    };

    return (
        <div className="container">
            <h1 className="page-title">
                <span className="material-icons-outlined">public</span>
                Gerenciamento de Eventos de Desastres (EONET)
            </h1>

            <div style={{ marginBottom: '0px', borderBottom: '1px solid var(--border-color, #ccc)' }}>
                <button style={tabButtonStyle('sincronizar')} onClick={() => setActiveTab('sincronizar')}>
                    <span className="material-icons-outlined">sync</span> Sincronizar NASA
                </button>
                <button style={tabButtonStyle('listarLocais')} onClick={() => setActiveTab('listarLocais')}>
                    <span className="material-icons-outlined">storage</span> Eventos Locais
                </button>
                <button style={tabButtonStyle('buscarProximos')} onClick={() => setActiveTab('buscarProximos')}>
                    <span className="material-icons-outlined">travel_explore</span> Buscar Próximos
                </button>
                <button style={tabButtonStyle('alertarUsuario')} onClick={() => setActiveTab('alertarUsuario')}>
                    <span className="material-icons-outlined">campaign</span> Alertar Usuário
                </button>
            </div>

            <div style={tabContentStyle}>
                {activeTab === 'sincronizar' && (
                    <section>
                        <h2 className="section-title">
                            <span className="material-icons-outlined">cloud_sync</span>
                            Sincronizar com NASA EONET
                        </h2>
                        <form onSubmit={handleSincronizar} className="form-container" style={{marginTop: '1rem'}}>
                            <div className="form-row">
                                <div className="form-group flex-item"><label htmlFor="syncLimit">Limite de eventos:</label><input type="number" id="syncLimit" name="limit" value={syncParams.limit} onChange={handleSyncParamChange} placeholder="Ex: 20 (padrão API: 10)" /></div>
                                <div className="form-group flex-item"><label htmlFor="syncDays">Dias anteriores:</label><input type="number" id="syncDays" name="days" value={syncParams.days} onChange={handleSyncParamChange} placeholder="Ex: 30 (padrão API: todos)" /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-item"><label htmlFor="syncStatus">Status do evento:</label><select id="syncStatus" name="status" value={syncParams.status} onChange={handleSyncParamChange}><option value="open">Abertos (open)</option><option value="closed">Fechados (closed)</option><option value="">Todos</option></select></div>
                                <div className="form-group flex-item"><label htmlFor="syncSource">Fonte do evento:</label><input type="text" id="syncSource" name="source" value={syncParams.source} onChange={handleSyncParamChange} placeholder="Ex: PDC, CEMS (opcional)" /></div>
                            </div>
                            <button type="submit" className="button button-primary" disabled={loadingSync} style={{marginTop: '10px'}}>
                                <span className="material-icons-outlined">sync</span>
                                {loadingSync ? 'Sincronizando...' : 'Iniciar Sincronização'}
                            </button>
                            {syncMensagem && !syncErro && <p className="message success" style={{marginTop: '15px'}}>{syncMensagem}</p>}
                            {syncErro && <p className="message error" style={{marginTop: '15px'}}>{syncErro}</p>}
                        </form>
                    </section>
                )}

                {activeTab === 'listarLocais' && (
                    <section>
                        <h2 className="section-title">
                            <span className="material-icons-outlined">list_alt</span>
                            Eventos EONET Armazenados Localmente
                        </h2>
                        {loadingListagemLocal && !eventosLocaisPage && <p className="message info">Carregando eventos locais...</p>}
                        {erroListagemLocal && <p className="message error">{erroListagemLocal}</p>}
                        {(!eventosLocaisPage || eventosLocaisPage.content.length === 0) && !loadingListagemLocal && !erroListagemLocal && (
                            <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed var(--border-color, #ccc)', borderRadius: 'var(--card-border-radius, 6px)', marginTop: '1rem' }}>
                                <p>Nenhum evento EONET encontrado no banco de dados local.</p>
                                <p>Vá para a aba &quot;Sincronizar NASA&quot; para buscar novos eventos.</p>
                            </div>
                        )}
                        {eventosLocaisPage && eventosLocaisPage.content.length > 0 && (
                            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                                {eventosLocaisPage.content.map(eonetResp => {
                                    const eventoDetalhes = eonetResp.json ? parseEonetEventJson(eonetResp.json) : null;
                                    const coords = eventoDetalhes?.geometry ? getCoordinatesFromEvent(eventoDetalhes.geometry) : null;
                                    const eventKey = `local-${eonetResp.idEonet}`;
                                    const miniMapMarker: EventMapMarkerData[] = coords && eventoDetalhes ? [{
                                        id: eventKey,
                                        position: coords,
                                        popupText: `<strong>${eventoDetalhes.title || 'Evento Local'}</strong>`
                                    }] : [];

                                    return (
                                        <li key={eventKey} className="desastre-page-event-list-item event-card-item-layout">
                                            <div style={{flex: '2 1 300px', minWidth: '280px'}}>
                                                {renderEventoItem(eventoDetalhes || { title: `Detalhes indisponíveis para ID ${eonetResp.eonetIdApi}` })}
                                                <small style={{display: 'block', textAlign:'right', color: 'var(--muted-text-color)', paddingRight: '15px', paddingBottom: '5px', marginTop:'5px'}}>
                                                    ID Local: {eonetResp.idEonet}, Data Registro: {formatDate(eonetResp.data?.toString())}
                                                </small>
                                            </div>
                                            {coords && eventoDetalhes ? (
                                                <div className="event-mini-map-container" style={{
                                                    flex: '1 1 250px', minHeight: '200px',
                                                    borderRadius: 'var(--card-border-radius, 8px)',
                                                    overflow: 'hidden', border: '1px solid #ccc'
                                                }}>
                                                    <DynamicEonetEventMap
                                                        key={eventKey + "-map"}
                                                        initialCenter={coords}
                                                        initialZoom={7}
                                                        markersData={miniMapMarker}
                                                        mapContainerStyle={{ height: '100%', width: '100%' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    minHeight: '200px', backgroundColor: '#e9ecef', borderRadius: 'var(--card-border-radius, 8px)',
                                                    padding: '10px', textAlign: 'center', color: '#6c757d', border: '1px solid #ced4da'
                                                }}>
                                                    <p>Mapa não disponível (sem coordenadas válidas no JSON local).</p>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        {eventosLocaisPage && eventosLocaisPage.totalPages > 1 && (
                             <div className="pagination-controls">
                                  <button onClick={() => setCurrentLocalPage(p => Math.max(0, p - 1))} disabled={eventosLocaisPage.first || loadingListagemLocal} className="button button-secondary"> <span className="material-icons-outlined">navigate_before</span> Anterior </button>
                                  <span>Página {eventosLocaisPage.number + 1} de {eventosLocaisPage.totalPages}</span>
                                  <button onClick={() => setCurrentLocalPage(p => Math.min(eventosLocaisPage.totalPages - 1, p + 1))} disabled={eventosLocaisPage.last || loadingListagemLocal} className="button button-secondary"> Próxima <span className="material-icons-outlined">navigate_next</span> </button>
                              </div>
                        )}
                    </section>
                )}

                {activeTab === 'buscarProximos' && (
                    <section>
                        <h2 className="section-title">
                            <span className="material-icons-outlined">map</span>
                            Buscar Eventos Próximos na NASA API
                        </h2>
                        <form onSubmit={handleBuscarProximidade} className="form-container" style={{marginTop: '1rem'}}>
                            <div className="form-row" style={{ alignItems: 'flex-end', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: '2 1 200px' }}>
                                    <label htmlFor="proxUsuarioIdInput">ID do Usuário (p/ buscar coords.):</label>
                                    <input type="number" id="proxUsuarioIdInput" name="clienteId" ref={usuarioIdRef} value={proximidadeParams.clienteId} onChange={handleProximidadeParamChange} placeholder="Opcional" />
                                </div>
                                <div className="form-group" style={{ flex: '0 0 auto', marginBottom: '1rem' }}>
                                    <button type="button" onClick={buscarCoordenadasCliente} className="button button-secondary" disabled={loadingProximidade || !proximidadeParams.clienteId} >
                                        <span className="material-icons-outlined">person_pin_circle</span> Buscar Coords
                                    </button>
                                </div>
                                <div className="form-group" style={{ flex: '3 1 auto', marginBottom: '1rem', display: 'flex', alignItems: 'center', minHeight: '50px' }}>
                                    {loadingProximidade && proximidadeParams.clienteId && !nomeUsuarioParaCoords && !erroProximidade && (
                                        <span className="message info" style={{padding: '0.5em 0.8em', margin: 0, fontSize:'0.9em', width: '100%'}}>Buscando usuário...</span>
                                    )}
                                    {nomeUsuarioParaCoords && (
                                        <span className="message success" style={{padding: '0.5em 0.8em', margin: 0, fontSize:'0.9em', width: '100%'}}>
                                            Coords. de: {nomeUsuarioParaCoords}
                                        </span>
                                    )}
                                    {erroProximidade && (proximidadeParams.clienteId && !nomeUsuarioParaCoords) && (erroProximidade.includes("Usuário") || erroProximidade.includes("ID de Usuário") || erroProximidade.includes("coordenadas")) && (
                                        <span className="message error" style={{padding: '0.5em 0.8em', margin: 0, fontSize:'0.9em', width: '100%'}}>{erroProximidade}</span>
                                    )}
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-item"> <label htmlFor="latitude">Latitude:</label> <input type="number" step="any" id="latitude" name="latitude" value={proximidadeParams.latitude} onChange={handleProximidadeParamChange} placeholder="-23.550520" required /> </div>
                                <div className="form-group flex-item"> <label htmlFor="longitude">Longitude:</label> <input type="number" step="any" id="longitude" name="longitude" value={proximidadeParams.longitude} onChange={handleProximidadeParamChange} placeholder="-46.633308" required /> </div>
                                <div className="form-group flex-item"> <label htmlFor="raioKm">Raio (km):</label> <input type="number" id="raioKm" name="raioKm" value={proximidadeParams.raioKm} onChange={handleProximidadeParamChange} placeholder="100" required /> </div>
                            </div>
                            <p style={{fontSize: '0.85em', color: 'var(--muted-text-color)', margin: '0.5rem 0 1rem 0'}}>Filtros adicionais (opcionais):</p>
                            <div className="form-row">
                                <div className="form-group flex-item"><label htmlFor="proxLimit">Limite:</label><input type="number" id="proxLimit" name="limit" value={proximidadeParams.limit} onChange={handleProximidadeParamChange} placeholder="Ex: 10"/></div>
                                <div className="form-group flex-item"><label htmlFor="proxDays">Dias Anteriores:</label><input type="number" id="proxDays" name="days" value={proximidadeParams.days} onChange={handleProximidadeParamChange} placeholder="Ex: 30"/></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group flex-item"><label htmlFor="proxStatus">Status:</label><select id="proxStatus" name="status" value={proximidadeParams.status} onChange={handleProximidadeParamChange}><option value="open">Abertos</option><option value="closed">Fechados</option><option value="">Todos</option></select></div>
                                <div className="form-group flex-item"><label htmlFor="proxSource">Fonte:</label><input type="text" id="proxSource" name="source" value={proximidadeParams.source} onChange={handleProximidadeParamChange} placeholder="Ex: PDC"/></div>
                            </div>
                            {(mensagemAlertaProximidade) && <p className="message success" style={{marginTop: '10px'}}>{mensagemAlertaProximidade}</p>}
                            {(erroAlertaProximidade) && <p className="message error" style={{marginTop: '10px'}}>{erroAlertaProximidade}</p>}
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                <button type="submit" className="button button-primary" disabled={loadingProximidade}>
                                    <span className="material-icons-outlined">search</span> Buscar Eventos Próximos
                                </button>
                            </div>
                            {erroProximidade && !(proximidadeParams.clienteId && (erroProximidade.includes("Usuário") || erroProximidade.includes("ID de Usuário") || erroProximidade.includes("coordenadas") )) && (
                                <p className="message error" style={{marginTop: '20px'}}>{erroProximidade}</p>
                            )}
                        </form>

                        {loadingProximidade && !eventosProximos.length && !(proximidadeParams.clienteId && !nomeUsuarioParaCoords && !erroProximidade) && (
                            <p className="message info" style={{textAlign:'center', margin:'15px 0'}}>Buscando eventos próximos na API da NASA...</p>
                        )}

                        {eventosProximos.length > 0 && !loadingProximidade && (
                            <div style={{marginTop: '20px'}}>
                                <h3 style={{borderBottom: '1px solid var(--border-color, #ccc)', paddingBottom:'5px', color: 'var(--text-color, black)', fontSize: '1.1rem', fontWeight: '600'}}>
                                    Resultados da Busca por Proximidade ({eventosProximos.length} evento(s)):
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, maxHeight: '500px', overflowY: 'auto', marginTop: '1rem' }}>
                                    {eventosProximos.map((evento, index) => {
                                        const coords = getCoordinatesFromEvent(evento.geometry);
                                        const eventKey = `${evento.id || 'evt'}-${index}`;
                                        const miniMapMarker: EventMapMarkerData[] = coords ? [{
                                            id: eventKey, position: coords,
                                            popupText: `<strong>${evento.title || 'Evento EONET'}</strong>`
                                        }] : [];
                                        return (
                                            <li key={eventKey} className="desastre-page-event-list-item event-card-item-layout">
                                                <div style={{flex: '2 1 300px', minWidth: '280px'}}>
                                                    {renderEventoItem(evento)}
                                                </div>
                                                {coords ? (
                                                    <div className="event-mini-map-container" style={{
                                                        flex: '1 1 250px', minHeight: '200px',
                                                        borderRadius: 'var(--card-border-radius, 8px)',
                                                        overflow: 'hidden', border: '1px solid #ccc'
                                                    }}>
                                                        <DynamicEonetEventMap
                                                            key={eventKey + "-map"} initialCenter={coords}
                                                            initialZoom={7} markersData={miniMapMarker}
                                                            mapContainerStyle={{ height: '100%', width: '100%' }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div style={{ flex: '1 1 250px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        minHeight: '200px', backgroundColor: '#e9ecef', borderRadius: 'var(--card-border-radius, 8px)',
                                                        padding: '10px', textAlign: 'center', color: '#6c757d', border: '1px solid #ced4da'
                                                    }}>
                                                        <p>Mapa não disponível (sem coordenadas válidas para este evento).</p>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                        {eventosProximos.length === 0 && !loadingProximidade && !erroProximidade && proximidadeParams.latitude && proximidadeParams.longitude && (
                            <p className="message info" style={{textAlign:'center', margin:'15px 0'}}>
                                Nenhum evento encontrado para os critérios de proximidade informados.
                            </p>
                        )}
                    </section>
                )}

                {activeTab === 'alertarUsuario' && (
                    <section>
                        <h2 className="section-title">
                            <span className="material-icons-outlined">campaign</span>
                            Disparar Alerta Específico para Usuário
                        </h2>
                        <form onSubmit={handleAlertarUsuarioSubmit} className="form-container" style={{marginTop: '1rem'}}>
                            <div className="form-row" style={{alignItems: 'flex-end', gap: '0.5rem'}}>
                                <div className="form-group" style={{flexGrow: 1}}>
                                    <label htmlFor="alertarUsuarioIdInput">ID do Usuário a ser Alertado:</label>
                                    <input type="number" id="alertarUsuarioIdInput" name="usuarioId" ref={alertarUsuarioIdInputRef} value={alertarUsuarioParams.usuarioId} onChange={handleAlertarUsuarioParamChange} placeholder="Digite o ID numérico" required />
                                </div>
                                <div className="form-group" style={{flexShrink: 0, marginBottom: '1rem'}}>
                                    <button type="button" onClick={handleVerificarUsuario} className="button button-secondary" disabled={loadingVerifyUsuario || !alertarUsuarioParams.usuarioId}>
                                        <span className="material-icons-outlined">person_search</span> Verificar Usuário
                                    </button>
                                </div>
                            </div>
                            {loadingVerifyUsuario && <p className="message info" style={{fontSize: '0.9em', marginTop: '-0.5rem', marginBottom: '1rem'}}>Verificando usuário...</p>}
                            {!loadingVerifyUsuario && verifiedUsuario && (
                                <div className="message success" style={{fontSize: '0.9em', padding: '0.5rem 1rem', marginBottom:'1rem', marginTop: '-0.5rem'}}>
                                    Usuário: <strong>{verifiedUsuario.nome} {verifiedUsuario.sobrenome}</strong><br/>
                                    Email Principal: {(Array.from(verifiedUsuario.contatos || [])[0]?.email) || "Não informado"}
                                </div>
                            )}
                            {!loadingVerifyUsuario && erroAlertarUsuario && alertarUsuarioParams.usuarioId && !verifiedUsuario && erroAlertarUsuario.toLowerCase().includes("usuário") && (
                                <p className="message error" style={{fontSize: '0.9em', padding: '0.5rem 1rem', marginBottom:'1rem', marginTop: '-0.5rem'}}>{erroAlertarUsuario}</p>
                            )}

                            <div className="form-row" style={{alignItems: 'flex-end', gap: '0.5rem', marginTop: '1rem'}}>
                                <div className="form-group" style={{flexGrow: 1}}>
                                    <label htmlFor="alertarEventoIdInput">ID do Evento EONET:</label>
                                    <input type="text" id="alertarEventoIdInput" name="eventoEonetId" value={alertarUsuarioParams.eventoEonetId} onChange={handleAlertarUsuarioParamChange} placeholder="Ex: EONET_5678" required />
                                </div>
                                <div className="form-group" style={{flexShrink: 0, marginBottom: '1rem'}}>
                                    <button type="button" onClick={handleVerificarEvento} className="button button-secondary" disabled={loadingVerifyEvento || !alertarUsuarioParams.eventoEonetId}>
                                        <span className="material-icons-outlined">event_available</span> Verificar Evento
                                    </button>
                                </div>
                            </div>
                            {loadingVerifyEvento && <p className="message info" style={{fontSize: '0.9em', marginTop: '-0.5rem', marginBottom: '1rem'}}>Verificando evento...</p>}
                            {!loadingVerifyEvento && verifiedEvento && (
                                <div className="message success" style={{fontSize: '0.9em', padding: '0.5rem 1rem', marginBottom:'1rem', marginTop: '-0.5rem'}}>
                                    Evento: <strong>{verifiedEvento.title}</strong> (ID: {verifiedEvento.id}) <br/>
                                    Data: {formatDate(verifiedEvento.geometry?.[0]?.date)}
                                </div>
                            )}
                            {!loadingVerifyEvento && erroAlertarUsuario && alertarUsuarioParams.eventoEonetId && !verifiedEvento && erroAlertarUsuario.toLowerCase().includes("evento") && (
                                <p className="message error" style={{fontSize: '0.9em', padding: '0.5rem 1rem', marginBottom:'1rem', marginTop: '-0.5rem'}}>{erroAlertarUsuario}</p>
                            )}

                            {!loadingAlertarUsuario && erroAlertarUsuario && !(erroAlertarUsuario.toLowerCase().includes("usuário") || erroAlertarUsuario.toLowerCase().includes("evento")) && (
                                <p className="message error" style={{marginTop: '1rem'}}>{erroAlertarUsuario}</p>
                            )}
                            {mensagemAlertarUsuario && <p className="message success" style={{marginTop: '1rem'}}>{mensagemAlertarUsuario}</p>}

                            <button type="submit" className="button button-primary" disabled={loadingAlertarUsuario || !verifiedUsuario || !verifiedEvento} style={{marginTop: '20px', width: '100%'}} >
                                <span className="material-icons-outlined">send</span>
                                {loadingAlertarUsuario ? 'Enviando Alerta...' : 'Enviar Alerta ao Usuário Verificado'}
                            </button>
                        </form>
                    </section>
                )}
            </div>

            <style jsx>{`
                .desastre-page-event-list-item {
                    background-color: var(--white-bg, #fff);
                    padding: 1rem;
                    margin-bottom: 1rem;
                    border-radius: var(--card-border-radius, 8px);
                    box-shadow: var(--card-shadow, 0 2px 4px rgba(0,0,0,0.05));
                    border: 1px solid var(--border-color, #ddd);
                    transition: transform 0.25s ease-out, box-shadow 0.25s ease-out;
                }
                .desastre-page-event-list-item:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--card-shadow-hover, 0 8px 20px rgba(0, 0, 0, 0.12));
                    position: relative;
                    z-index: 10;
                }
                .event-card-item-layout {
                    display: flex;
                    gap: 15px;
                }
                @media (max-width: 767px) {
                    .event-card-item-layout {
                        flex-direction: column;
                    }
                }
                .desastre-page-event-list-item .client-info-section a {
                    pointer-events: auto !important;
                }
            `}</style>
        </div>
    );
}