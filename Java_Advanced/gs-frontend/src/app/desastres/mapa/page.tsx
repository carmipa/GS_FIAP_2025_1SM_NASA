'use client';

import React, { useState, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { buscarEventosNasaProximos, buscarClientePorId } from '@/lib/apiService';
import type { NasaEonetEventDTO, NasaEonetGeometryDTO, ClienteResponseDTO } from '@/lib/types';
import type { EventMapMarkerData } from '@/components/EonetEventMap';

const DynamicEonetEventMap = dynamic(() => import('@/components/EonetEventMap'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center w-full h-full bg-slate-100/80 rounded-md" style={{minHeight: '400px'}}>
            <p className="text-center text-slate-600 py-4 text-lg">Carregando mapa...</p>
        </div>
    ),
});

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
    } catch {
        return 'Data inválida'; 
    }
};


export default function MapaEventosUsuarioPage() {
    const [markers, setMarkers] = useState<EventMapMarkerData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>("Insira o ID de um usuário para buscar eventos próximos à sua localização.");
    const [usuarioIdInput, setUsuarioIdInput] = useState<string>('');
    const [searchedUser, setSearchedUser] = useState<ClienteResponseDTO | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([-14.235004, -51.92528]);
    const [mapZoom, setMapZoom] = useState<number>(4);

    const searchRadiusKm = 1000;
    const eventLimit = 50;
    const eventDays = 30;

    const handleBuscaPorUsuario = async (e: FormEvent) => {
        e.preventDefault();
        if (!usuarioIdInput.trim()) {
            setError("Por favor, insira um ID de usuário.");
            setInfoMessage(null);
            setSearchedUser(null);
            setMarkers([]);
            return;
        }
        setLoading(true);
        setError(null);
        setInfoMessage(null);
        setMarkers([]);
        setSearchedUser(null);

        try {
            const idNum = Number(usuarioIdInput);
            if (isNaN(idNum) || idNum <= 0) {
                throw new Error("ID do usuário deve ser um número positivo.");
            }

            const cliente = await buscarClientePorId(idNum);
            if (!cliente) {
                throw new Error(`Usuário com ID ${idNum} não encontrado.`);
            }
            const enderecosArray = cliente.enderecos ? Array.from(cliente.enderecos) : [];
            if (enderecosArray.length === 0 || !enderecosArray[0]) {
                throw new Error(`Usuário ${cliente.nome} (ID: ${idNum}) encontrado, mas não possui endereços cadastrados.`);
            }
            const enderecoPrincipal = enderecosArray[0];
            if (typeof enderecoPrincipal.latitude !== 'number' || typeof enderecoPrincipal.longitude !== 'number' || enderecoPrincipal.latitude === 0 || enderecoPrincipal.longitude === 0) {
                throw new Error(`Endereço principal do usuário ${cliente.nome} (ID: ${idNum}) não possui coordenadas válidas (Lat: ${enderecoPrincipal.latitude}, Lon: ${enderecoPrincipal.longitude}).`);
            }

            setSearchedUser(cliente);
            const userLat = enderecoPrincipal.latitude;
            const userLon = enderecoPrincipal.longitude;

            setMapCenter([userLat, userLon]);
            setMapZoom(8); 

            setInfoMessage(`Buscando eventos próximos a ${cliente.nome} (Lat: ${userLat.toFixed(4)}, Lon: ${userLon.toFixed(4)})...`);

            const eventosProximos: NasaEonetEventDTO[] = await buscarEventosNasaProximos(
                userLat, userLon, searchRadiusKm,
                eventLimit, eventDays, 'open', undefined
            );

            if (!eventosProximos || eventosProximos.length === 0) {
                setInfoMessage(`Nenhum evento aberto encontrado próximo a ${cliente.nome} nos últimos ${eventDays} dias (raio de ${searchRadiusKm}km).`);
                setLoading(false);
                return;
            }

            const newMarkers: EventMapMarkerData[] = [];
            // O tipo de 'eventoNasa' é inferido a partir do array 'eventosProximos'
            for (const eventoNasa of eventosProximos) {
                if (eventoNasa.geometry && eventoNasa.geometry.length > 0) {
                    const coords = getCoordinatesFromEvent(eventoNasa.geometry);
                    if (coords) {
                        newMarkers.push({
                            id: eventoNasa.id,
                            position: coords,
                            popupText: `<strong>${eventoNasa.title || 'Evento EONET'}</strong><br/>Data: ${formatDate(eventoNasa.geometry[0].date)}<br/>Categorias: ${eventoNasa.categories?.map(c => c.title).join(', ') || 'N/A'}`,
                        });
                    }
                }
            }
            setMarkers(newMarkers);
            if (newMarkers.length > 0) {
                setInfoMessage(`${newMarkers.length} evento(s) encontrado(s) próximo(s) a ${cliente.nome}.`);
            } else {
                setInfoMessage(`Eventos foram encontrados próximos a ${cliente.nome}, mas nenhum possui coordenadas válidas para exibição no mapa.`);
            }

        } catch (err: unknown) {
            console.error("Erro na busca por usuário ou eventos próximos:", err);
            let errorMessage = 'Falha ao processar a busca. Verifique o ID do usuário e tente novamente.';
            if (err instanceof Error) {
                errorMessage = err.message || errorMessage;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            setError(errorMessage);
            setInfoMessage(null);
            setSearchedUser(null);
            setMarkers([]);
            setMapCenter([-14.235004, -51.92528]);
            setMapZoom(4);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container_mapa_eventos_page" style={{paddingBottom: '20px', fontFamily: 'Arial, sans-serif'}}>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <span className="material-icons-outlined" style={{ fontSize: '1.8em' }}>person_pin_circle</span>
                Mapa de Eventos por Usuário (NASA API)
            </h1>

            <form onSubmit={handleBuscaPorUsuario} className="form-container" style={{ maxWidth: '500px', margin: '0 auto 30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <div className="form-group">
                    <label htmlFor="usuarioIdInput" style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>ID do Usuário Cadastrado:</label>
                    <input
                        type="number"
                        id="usuarioIdInput"
                        value={usuarioIdInput}
                        onChange={(e) => setUsuarioIdInput(e.target.value)}
                        placeholder="Digite o ID numérico do usuário"
                        style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '10px'}}
                    />
                </div>
                <button type="submit" className="button button-primary" disabled={loading} style={{width: '100%', padding: '10px', fontSize: '1em'}}>
                    {loading ? 'Buscando...' : 'Buscar Eventos para Usuário'}
                </button>
            </form>

            {loading && (
                <div style={{textAlign: 'center', margin: '20px 0'}}><p className="message info">Processando busca...</p></div>
            )}
            {error && !loading && (
                <div className="message error" style={{textAlign: 'center', padding: '15px', border: '1px solid #f5c6cb', borderRadius: '8px', backgroundColor: '#f8d7da', color: '#721c24', maxWidth: '700px', margin: '20px auto'}}>
                    <p style={{margin:0}}>{error}</p>
                </div>
            )}
            {infoMessage && !loading && !error && (
                 <p className="message info" style={{textAlign: 'center', margin: '20px 0', color: '#555', fontSize: '1em'}}>{infoMessage}</p>
            )}
            
            {searchedUser && !loading && !error && (
                <div style={{
                    margin: '20px auto',
                    padding: '15px 20px',
                    border: '1px solid #007bff',
                    borderRadius: '8px',
                    backgroundColor: '#e7f3ff',
                    maxWidth: '750px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#0056b3', borderBottom: '1px solid #b8d8f3', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons-outlined" style={{ fontSize: '1.3em'}}>account_circle</span>
                        Exibindo Eventos Para:
                    </h3>
                    <p style={{ margin: '5px 0' }}><strong>Nome:</strong> {searchedUser.nome} {searchedUser.sobrenome || ''} (ID: {searchedUser.idCliente})</p>

                    {(searchedUser.enderecos && Array.from(searchedUser.enderecos).length > 0) ? (() => {
                        const enderecoPrincipal = Array.from(searchedUser.enderecos)[0];
                        return (
                            <>
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Endereço Principal:</strong> {enderecoPrincipal.logradouro || ''}, {enderecoPrincipal.numero || ''} {enderecoPrincipal.complemento ? `- ${enderecoPrincipal.complemento}` : ''}, {enderecoPrincipal.bairro || ''} - {enderecoPrincipal.localidade || 'N/D'} / {enderecoPrincipal.uf || 'N/D'} (CEP: {enderecoPrincipal.cep || 'N/D'})
                                </p>
                                <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                                    <span className="material-icons-outlined" style={{fontSize: '1em', verticalAlign: 'bottom', marginRight:'4px'}}>location_on</span>
                                    Coordenadas Base: Latitude: {enderecoPrincipal.latitude?.toFixed(5) || 'N/A'}, Longitude: {enderecoPrincipal.longitude?.toFixed(5) || 'N/A'}
                                </p>
                            </>
                        );
                    })() : (
                        <p style={{ margin: '5px 0', fontStyle: 'italic' }}>Endereço principal ou coordenadas não disponíveis.</p>
                    )}

                    {(searchedUser.contatos && Array.from(searchedUser.contatos).length > 0) ? (() => {
                        const contatoPrincipal = Array.from(searchedUser.contatos)[0];
                        return (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #b8d8f3' }}>
                                <h4 style={{margin: '0 0 5px 0', color: '#0056b3', fontSize:'1em'}}>Contato Principal:</h4>
                                <ul style={{ listStyle: 'none', paddingLeft: '0', margin: 0 }}>
                                    {contatoPrincipal.email && <li><span className="material-icons-outlined" style={{fontSize: '1em', verticalAlign: 'middle', marginRight:'4px'}}>email</span> {contatoPrincipal.email}</li>}
                                    {contatoPrincipal.telefone && <li><span className="material-icons-outlined" style={{fontSize: '1em', verticalAlign: 'middle', marginRight:'4px'}}>phone</span> ({contatoPrincipal.ddd}) {contatoPrincipal.telefone}</li>}
                                    {contatoPrincipal.celular && <li><span className="material-icons-outlined" style={{fontSize: '1em', verticalAlign: 'middle', marginRight:'4px'}}>smartphone</span> ({contatoPrincipal.ddd}) {contatoPrincipal.celular}</li>}
                                    {contatoPrincipal.whatsapp && <li><span className="material-icons-outlined" style={{fontSize: '1em', verticalAlign: 'middle', marginRight:'4px', color: 'green'}}>whatsapp</span> ({contatoPrincipal.ddd}) {contatoPrincipal.whatsapp}</li>}
                                </ul>
                            </div>
                        );
                    })() : (
                        <p style={{ margin: '5px 0', fontStyle: 'italic', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #b8d8f3' }}>Informações de contato não disponíveis.</p>
                    )}
                </div>
            )}

            <div style={{ height: '70vh', minHeight: '500px', width: '100%', marginTop: '20px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
                <DynamicEonetEventMap
                    initialCenter={mapCenter}
                    initialZoom={mapZoom}
                    markersData={markers}
                />
                {markers.length === 0 && !loading && !error && (!searchedUser || !infoMessage?.includes("encontrado(s) próximo(s)")) && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '20px 30px', borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)', textAlign: 'center', zIndex: 1000
                    }}
                        className="text-slate-700 text-lg p-4 rounded-md shadow-lg"
                    >
                        {infoMessage || "Utilize a busca acima para encontrar eventos próximos a um usuário."}
                    </div>
                )}
            </div>
        </div>
    );
}