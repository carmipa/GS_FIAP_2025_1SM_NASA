'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { buscarEventosNasaProximos } from '@/lib/apiService';
import type { NasaEonetEventDTO, NasaEonetGeometryDTO } from '@/lib/types';
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

const formatEventDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'Data não disponível';
    try {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
        });
    } catch { return 'Data inválida'; }
};

export default function MapaEventosAtuaisNasaPage() {
    const [markers, setMarkers] = useState<EventMapMarkerData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string>('Use os filtros de data ou aguarde a busca pelo evento global mais recente.');
    const [displayedEventDetails, setDisplayedEventDetails] = useState<NasaEonetEventDTO | null>(null);
    const [detailedEventsList, setDetailedEventsList] = useState<NasaEonetEventDTO[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [mainMapCenter, setMainMapCenter] = useState<[number, number]>([0, 0]);
    const [mainMapZoom, setMainMapZoom] = useState<number>(2);
    
    const fetchLimitGlobalRecente = 1;
    const fetchDaysGlobalRecente = 60;
    const fetchStatusGlobalRecente = 'open';
    const queryLimitDateRange = 50;
    const queryStatusDateRange = 'all';

    useEffect(() => {
        const fetchInitialMostRecentEvent = async () => {
            setLoading(true);
            setError(null);
            setInfoMessage(`Buscando o evento global aberto mais recente (últimos ${fetchDaysGlobalRecente} dias)...`);
            setMarkers([]);
            setDisplayedEventDetails(null);
            setDetailedEventsList([]);

            try {
                const eventosDaNasa: NasaEonetEventDTO[] = await buscarEventosNasaProximos(
                    undefined, undefined, undefined,
                    fetchLimitGlobalRecente, fetchDaysGlobalRecente, fetchStatusGlobalRecente, undefined
                );

                if (eventosDaNasa && eventosDaNasa.length > 0) {
                    const eventoNasa = eventosDaNasa[0];
                    setDisplayedEventDetails(eventoNasa);

                    if (eventoNasa.geometry && eventoNasa.geometry.length > 0) {
                        const coords = getCoordinatesFromEvent(eventoNasa.geometry);
                        if (coords) {
                            const newMarker = {
                                id: eventoNasa.id,
                                position: coords,
                                popupText: `<strong>${eventoNasa.title || 'Evento EONET'}</strong><br/>Data: ${formatEventDate(eventoNasa.geometry[0].date)}<br/>Categorias: ${eventoNasa.categories?.map(c => c.title).join(', ') || 'N/A'}`,
                            };
                            setMarkers([newMarker]);
                            setMainMapCenter(coords);
                            setMainMapZoom(7);
                            setInfoMessage(`Exibindo o evento global mais recente encontrado.`);
                            setError(null);
                        } else {
                            setInfoMessage('');
                            setError(`Evento global mais recente (ID: ${eventoNasa.id}) encontrado, mas não possui coordenadas válidas para o mapa. Detalhes abaixo.`);
                        }
                    } else {
                        setInfoMessage('');
                        setError(`Evento global mais recente (ID: ${eventoNasa.id}) encontrado, mas não possui informações de geometria. Detalhes abaixo.`);
                    }
                } else {
                    setInfoMessage('');
                    setError(`Nenhum evento global aberto encontrado na API da NASA para os últimos ${fetchDaysGlobalRecente} dias.`);
                }
            } catch (err: unknown) {
                console.error("Erro ao buscar o evento mais recente da NASA:", err);
                let errorMessage = "Falha ao buscar evento da NASA.";
                if (err instanceof Error) {
                    errorMessage = err.message || errorMessage;
                } else if (typeof err === 'string') {
                    errorMessage = err;
                }
                setError(errorMessage);
                setInfoMessage('');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialMostRecentEvent();
    }, []);

    const handleSearchByDateRange = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        if (!startDate || !endDate) {
            setError("Por favor, selecione uma data de início e uma data de fim para a busca por período.");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setError("A data de início não pode ser posterior à data de fim.");
            return;
        }

        setLoading(true);
        setError(null);
        setInfoMessage(`Buscando eventos da NASA entre ${formatEventDate(startDate)} e ${formatEventDate(endDate)}...`);
        setMarkers([]);
        setDisplayedEventDetails(null);
        setDetailedEventsList([]);
        setMainMapCenter([0,0]);
        setMainMapZoom(2);

        try {
            const eventosDaNasa: NasaEonetEventDTO[] = await buscarEventosNasaProximos(
                undefined, undefined, undefined,
                queryLimitDateRange,
                undefined,
                queryStatusDateRange,
                undefined,
                startDate,
                endDate,
                undefined
            );

            const newMarkersForMainMap: EventMapMarkerData[] = [];
            const validEventsForDetailedList: NasaEonetEventDTO[] = [];

            if (eventosDaNasa && eventosDaNasa.length > 0) {
                for (const eventoNasa of eventosDaNasa) {
                    if (eventoNasa.geometry && eventoNasa.geometry.length > 0) {
                        const coords = getCoordinatesFromEvent(eventoNasa.geometry);
                        if (coords) {
                            newMarkersForMainMap.push({
                                id: eventoNasa.id,
                                position: coords,
                                popupText: `<strong>${eventoNasa.title || 'Evento EONET'}</strong><br/>Data: ${formatEventDate(eventoNasa.geometry[0].date)}<br/>Categorias: ${eventoNasa.categories?.map(c => c.title).join(', ') || 'N/A'}`,
                            });
                        }
                    }
                    // Adiciona à lista detalhada mesmo sem coordenadas para exibição textual
                    validEventsForDetailedList.push(eventoNasa);
                }

                setMarkers(newMarkersForMainMap);

                if (validEventsForDetailedList.length === 1 && newMarkersForMainMap.length === 1) {
                    setDisplayedEventDetails(validEventsForDetailedList[0]);
                    setDetailedEventsList([]); // Limpa a lista se estamos mostrando um evento único
                    setInfoMessage(`Exibindo 1 evento encontrado.`);
                    if(newMarkersForMainMap[0]?.position) {
                        setMainMapCenter(newMarkersForMainMap[0].position);
                        setMainMapZoom(7);
                    }
                } else if (validEventsForDetailedList.length > 0) {
                    setDetailedEventsList(validEventsForDetailedList);
                    setDisplayedEventDetails(null); // Limpa o evento único se temos uma lista
                    setInfoMessage(`Exibindo ${validEventsForDetailedList.length} evento(s) encontrado(s). ${newMarkersForMainMap.length} com coordenadas para o mapa principal.`);
                    if (newMarkersForMainMap.length > 0 && newMarkersForMainMap[0]?.position) {
                        setMainMapCenter(newMarkersForMainMap[0].position);
                        setMainMapZoom(5);
                    }
                } else { // Nenhum evento válido após o processamento
                    setInfoMessage('');
                    setError(`Nenhum evento encontrado para o período e filtros aplicados, ou os eventos encontrados não puderam ser processados.`);
                }
            } else { // Nenhum evento retornado pela API
                setInfoMessage('');
                setError(`Nenhum evento encontrado na API da NASA para o período de ${formatEventDate(startDate)} a ${formatEventDate(endDate)} com os filtros aplicados.`);
            }
        } catch (err: unknown) {
            console.error("MAPA ATUAIS (BUSCA POR DATA) - Erro:", err);
            let errorMessage = "Falha ao buscar eventos da NASA por data.";
            if (err instanceof Error) {
                errorMessage = err.message || errorMessage;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            setError(errorMessage);
            setInfoMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container_mapa_eventos_atuais_page" style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px', fontSize: '1.8em', color: '#333' }}>
                <span className="material-icons-outlined" style={{ fontSize: '1.5em', verticalAlign: 'bottom' }}>public</span>
                Mapa de Eventos Atuais/Por Data (NASA EONET)
            </h1>

            <p style={{textAlign: 'center', marginBottom: '20px', fontSize: '0.9em', color: '#555'}}>
                Exibe o evento global aberto mais recente (últimos {fetchDaysGlobalRecente} dias) ou busque por período.
            </p>

            <form onSubmit={handleSearchByDateRange} className="form-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '700px', margin: '0 auto 30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <div style={{display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap'}}>
                    <div className="form-group" style={{flex: '1 1 200px'}}>
                        <label htmlFor="startDate" style={{display: 'block', marginBottom: '5px', fontSize: '0.9em'}}>Data de Início:</label>
                        <input type="date" id="startDate" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}/>
                    </div>
                    <div className="form-group" style={{flex: '1 1 200px'}}>
                        <label htmlFor="endDate" style={{display: 'block', marginBottom: '5px', fontSize: '0.9em'}}>Data de Fim:</label>
                        <input type="date" id="endDate" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}/>
                    </div>
                    <div className="form-group">
                        <button type="submit" className="button button-primary" disabled={loading || !startDate || !endDate} style={{padding: '10px 15px', backgroundColor: (loading || !startDate || !endDate) ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <span className="material-icons-outlined" style={{fontSize: '1.2em'}}>search</span> Buscar
                        </button>
                    </div>
                </div>
                {(!startDate || !endDate) && !loading && <p style={{fontSize: '0.8em', textAlign: 'center', color: '#777', marginTop: '5px'}}>Selecione um intervalo de datas para habilitar a busca.</p>}
            </form>

            {displayedEventDetails && detailedEventsList.length === 0 && !loading && (
                <div className="event-details-box" style={{
                    margin: '20px auto', padding: '20px', border: '1px solid #ddd',
                    borderRadius: '8px', backgroundColor: '#f9f9f9', maxWidth: '700px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginTop: '0', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', fontSize: '1.3em', color: '#0056b3', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons-outlined" style={{verticalAlign: 'bottom'}}>event_note</span>
                        Detalhes do Evento Exibido
                    </h3>
                    <p><strong>Título:</strong> {displayedEventDetails.title}</p>
                    {displayedEventDetails.geometry?.[0]?.date && <p><strong>Data:</strong> {formatEventDate(displayedEventDetails.geometry[0].date)}</p>}
                    <p><strong>ID EONET:</strong> {displayedEventDetails.id}</p>
                    {displayedEventDetails.categories && displayedEventDetails.categories.length > 0 && (
                        <p><strong>Categorias:</strong> {displayedEventDetails.categories.map(c => c.title).join(', ')}</p>
                    )}
                    {markers.find(m => m.id === displayedEventDetails.id)?.position && (
                        <p><strong>Coordenadas:</strong> Latitude: {markers.find(m => m.id === displayedEventDetails.id)!.position[0].toFixed(5)}, Longitude: {markers.find(m => m.id === displayedEventDetails.id)!.position[1].toFixed(5)}</p>
                    )}
                    <p><strong>Status:</strong> {displayedEventDetails.closed ? `Fechado em ${formatEventDate(displayedEventDetails.closed)}` : 'Aberto'}</p>
                    {displayedEventDetails.link && <p><a href={displayedEventDetails.link} target="_blank" rel="noopener noreferrer" className="link-external" style={{color: '#007bff', textDecoration: 'none', fontWeight: 'bold'}}>
                        Ver na fonte (EONET) <span className="material-icons-outlined" style={{fontSize: '1em', verticalAlign: 'middle'}}>open_in_new</span>
                    </a></p>}
                </div>
            )}

            {detailedEventsList.length > 0 && !loading && (
                <section className="multiple-events-list" style={{ margin: '30px auto', maxWidth: '950px' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '1.6em', color: '#333', borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '25px' }}>
                        {detailedEventsList.length} Evento(s) Encontrado(s) no Período
                    </h3>
                    {detailedEventsList.map((evento) => {
                        const eventKey = evento.id || `event-${Math.random().toString(36).substr(2, 9)}`;
                        const coords = evento.geometry ? getCoordinatesFromEvent(evento.geometry) : null;

                        const miniMapMarker: EventMapMarkerData[] = coords ? [{
                            id: eventKey,
                            position: coords,
                            popupText: `<strong>${evento.title || 'Evento EONET'}</strong>`
                        }] : [];

                        return (
                            <div key={eventKey} className="event-card-with-map" style={{
                                display: 'flex', flexDirection: typeof window !== 'undefined' && window.innerWidth < 768 ? 'column' : 'row',
                                gap: '20px', padding: '20px', border: '1px solid #ccc',
                                borderRadius: '10px', marginBottom: '20px', backgroundColor: '#fff',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }}>
                                <div className="event-info" style={{ flex: 1, minWidth: '280px' }}>
                                    <h4 style={{ marginTop: 0, color: '#0056b3', fontSize: '1.2em', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '12px' }}>
                                        {evento.title || 'Título não disponível'}
                                    </h4>
                                    {evento.geometry?.[0]?.date && <p><strong>Data:</strong> {formatEventDate(evento.geometry[0].date)}</p>}
                                    <p><strong>ID EONET:</strong> {evento.id || 'N/A'}</p>
                                    {evento.categories && evento.categories.length > 0 && (
                                        <p><strong>Categorias:</strong> {evento.categories.map(c => c.title).join(', ')}</p>
                                    )}
                                    {coords && (<p><strong>Coordenadas:</strong> Lat: {coords[0].toFixed(4)}, Lon: {coords[1].toFixed(4)}</p>)}
                                    <p><strong>Status:</strong> {evento.closed ? `Fechado em ${formatEventDate(evento.closed)}` : 'Aberto'}</p>
                                    {evento.link && <p><a href={evento.link} target="_blank" rel="noopener noreferrer" className="link-external" style={{color: '#007bff', textDecoration: 'none', fontWeight: 'bold'}}>
                                        Ver na fonte (EONET) <span className="material-icons-outlined" style={{fontSize: '1em', verticalAlign: 'middle'}}>open_in_new</span>
                                    </a></p>}
                                </div>
                                {coords ? (
                                    <div className="event-mini-map" style={{
                                        flex: 1, minHeight: '280px', minWidth: '300px',
                                        borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd'
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
                                    <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', backgroundColor: '#f0f0f0', borderRadius: '8px', padding: '10px', textAlign: 'center', color: '#666'}}>
                                        <p>Mapa não disponível (sem coordenadas válidas para este evento).</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </section>
            )}
            
            {loading && !detailedEventsList.length && !displayedEventDetails && (
                <div style={{minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px auto', maxWidth: '700px'}}>
                    <p className="message info" style={{color: '#555', fontSize: '1.1em'}}>Buscando eventos...</p>
                </div>
            )}
            {error && !loading && (
                <div className="message error" style={{
                    textAlign: 'center', padding: '15px', border: '1px solid #f5c6cb',
                    borderRadius: '8px', marginTop: '20px', backgroundColor: '#f8d7da',
                    color: '#721c24', maxWidth: '700px', margin: '20px auto'
                }}>
                    <p style={{margin: 0}}>{error}</p>
                </div>
            )}
            {infoMessage && !loading && !error && detailedEventsList.length === 0 && !displayedEventDetails && (
                <p className="message info" style={{textAlign: 'center', margin: '20px 0', color: '#555', fontSize: '1em'}}>{infoMessage}</p>
            )}

            {(!loading || markers.length > 0) && !error && detailedEventsList.length === 0 && (
                <div style={{marginTop: '30px', borderTop: '2px solid #007bff', paddingTop: '20px'}}>
                    <h3 style={{textAlign: 'center', fontSize: '1.6em', color: '#333', marginBottom: '15px'}}>
                        {markers.length > 1 ? "Visão Geral dos Eventos no Mapa" : (markers.length === 1 ? "Localização do Evento no Mapa" : "Mapa Global")}
                    </h3>
                    <div style={{ height: '65vh', minHeight: '500px', width: '100%', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
                        <DynamicEonetEventMap
                            initialCenter={mainMapCenter} 
                            initialZoom={mainMapZoom}    
                            markersData={markers}
                        />
                        {markers.length === 0 && !loading && !error && (
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '20px 30px', borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.2)', textAlign: 'center', zIndex: 1000, color: '#4A5568'
                            }}>
                                {startDate && endDate ? 'Nenhum evento com coordenadas para exibir no mapa para o período.' : 'Mapa pronto. Aguardando busca ou carregamento inicial.'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}