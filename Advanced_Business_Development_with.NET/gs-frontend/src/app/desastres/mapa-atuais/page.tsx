// src/app/desastres/mapa-atuais/page.tsx
// Este componente deve ser compatível com as definições de apiService.ts e types.ts
// que foram alinhadas com o backend C#.
'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { buscarEventosNasaProximos } from '@/lib/apiService';
import type { NasaEonetEventDTO, NasaEonetGeometryDTO } from '@/lib/types';
import type { EventMapMarkerData } from '@/lib/types'; // Usando EventMapMarkerData de types.ts

const DynamicEonetEventMap = dynamic(() => import('@/components/EonetEventMap'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center w-full h-full bg-slate-100/80 rounded-md" style={{minHeight: '400px'}}>
            <p className="text-center text-slate-600 py-4 text-lg">Carregando mapa...</p>
        </div>
    ),
});

const getCoordinatesFromEvent = (geometries: NasaEonetGeometryDTO[] | undefined): [number, number] | null => {
    if (!geometries || geometries.length === 0) return null;

    const pointGeometry = geometries.find(geom => geom.type === "Point");
    if (pointGeometry && Array.isArray(pointGeometry.coordinates) && pointGeometry.coordinates.length === 2) {
        // NASA EONET: [longitude, latitude]
        return [pointGeometry.coordinates[1] as number, pointGeometry.coordinates[0] as number]; // Leaflet: [latitude, longitude]
    }

    const firstGeom = geometries[0];
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
            hour: '2-digit', minute: '2-digit', timeZone: 'UTC' // Especificar UTC se a data da API for UTC
        });
    } catch (e) { return 'Data inválida'; }
};


export default function MapaEventosAtuaisNasaPage() {
    const [markers, setMarkers] = useState<EventMapMarkerData[]>([]);
    const [loading, setLoading] = useState<boolean>(false); // Inicia como false, useEffect inicial dispara o loading
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string>('Use os filtros de data para buscar eventos ou veja o evento mais recente global abaixo (se disponível).');
    const [displayedEventDetails, setDisplayedEventDetails] = useState<NasaEonetEventDTO | null>(null);

    const fetchLimitGlobalRecente = 1;
    const fetchDaysGlobalRecente = 60; // Últimos 60 dias para o evento mais recente
    const fetchStatusGlobalRecente = 'open'; // Por padrão, busca eventos abertos para o mais recente

    useEffect(() => {
        const fetchInitialMostRecentEvent = async () => {
            setLoading(true);
            setError(null);
            setInfoMessage(`Buscando o evento global mais recente (status: ${fetchStatusGlobalRecente || 'todos'}, últimos ${fetchDaysGlobalRecente} dias)...`);
            setMarkers([]);
            setDisplayedEventDetails(null);

            try {
                const eventosDaNasa: NasaEonetEventDTO[] = await buscarEventosNasaProximos(
                    undefined, undefined, undefined, // lat, lon, radius (sem filtro geo para o global)
                    fetchLimitGlobalRecente,
                    fetchDaysGlobalRecente,
                    fetchStatusGlobalRecente,
                    undefined // source
                );

                if (eventosDaNasa && eventosDaNasa.length > 0) {
                    const eventoNasa = eventosDaNasa[0];
                    setDisplayedEventDetails(eventoNasa);

                    if (eventoNasa.geometry && eventoNasa.geometry.length > 0) {
                        const coords = getCoordinatesFromEvent(eventoNasa.geometry);
                        if (coords) {
                            setMarkers([{
                                id: eventoNasa.id,
                                position: coords,
                                popupText: `<strong>${eventoNasa.title || 'Evento EONET'}</strong><br/>Data: ${formatEventDate(eventoNasa.geometry[0].date)}<br/>Categorias: ${eventoNasa.categories?.map(c => c.title).join(', ') || 'N/A'}`,
                            }]);
                            setInfoMessage(`Exibindo o evento global mais recente encontrado com coordenadas válidas.`);
                            setError(null);
                        } else {
                            setInfoMessage('');
                            setError(`Evento global mais recente (ID: ${eventoNasa.id}) encontrado, mas não possui coordenadas válidas para o mapa.`);
                        }
                    } else {
                        setInfoMessage('');
                        setError(`Evento global mais recente (ID: ${eventoNasa.id}) encontrado, mas não possui informações de geometria.`);
                    }
                } else {
                    setInfoMessage('');
                    setError(`Nenhum evento global encontrado na API da NASA para os últimos ${fetchDaysGlobalRecente} dias com os status selecionados.`);
                }
            } catch (err: any) {
                console.error("Erro ao buscar o evento mais recente da NASA:", err);
                setInfoMessage('');
                setError(`Falha ao buscar evento da NASA: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialMostRecentEvent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Executa apenas uma vez ao montar o componente

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const queryLimitDateRange = 50; // Limite para buscas por data
    const queryStatusDateRange = 'open'; // Exemplo: buscar apenas abertos por padrão na busca por data

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
        setInfoMessage(`Buscando eventos da NASA entre ${startDate} e ${endDate} (status: ${queryStatusDateRange || 'todos'})...`);
        setMarkers([]);
        setDisplayedEventDetails(null);
        try {
            const eventosDaNasa: NasaEonetEventDTO[] = await buscarEventosNasaProximos(
                undefined, undefined, undefined, // lat, lon, radius (sem filtro geo)
                queryLimitDateRange,
                undefined, // days (usando startDate e endDate em vez disso)
                queryStatusDateRange,
                undefined, // source
                startDate,
                endDate
            );

            const newMarkers: EventMapMarkerData[] = [];
            if (eventosDaNasa && eventosDaNasa.length > 0) {
                setDisplayedEventDetails(null); // Limpa detalhes de evento único se múltiplos são retornados
                for (const eventoNasa of eventosDaNasa) {
                    if (eventoNasa.geometry && eventoNasa.geometry.length > 0) {
                        const coords = getCoordinatesFromEvent(eventoNasa.geometry);
                        if (coords) {
                            newMarkers.push({
                                id: eventoNasa.id,
                                position: coords,
                                popupText: `<strong>${eventoNasa.title || 'Evento EONET'}</strong><br/>Data: ${formatEventDate(eventoNasa.geometry[0].date)}<br/>Categorias: ${eventoNasa.categories?.map(c => c.title).join(', ') || 'N/A'}`,
                            });
                        }
                    }
                }
                // Se apenas um evento for retornado da busca por data, define-o para exibição de detalhes
                if (newMarkers.length === 1 && eventosDaNasa.length === 1) {
                    setDisplayedEventDetails(eventosDaNasa[0]);
                }
            }

            setMarkers(newMarkers);
            if (newMarkers.length === 0) {
                setInfoMessage('');
                setError(`Nenhum evento encontrado na API da NASA para o período de ${startDate} a ${endDate} com os filtros aplicados (ou eventos encontrados não possuem coordenadas válidas).`);
            } else {
                setInfoMessage(`Exibindo ${newMarkers.length} evento(s) encontrado(s) entre ${startDate} e ${endDate}.`);
            }

        } catch (err: any) {
            console.error("MAPA ATUAIS (BUSCA POR DATA) - Erro:", err);
            setInfoMessage('');
            setError(`Falha ao buscar eventos da NASA por data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const initialMapCenter: [number, number] = [0, 0]; // Centro global para o mapa inicial
    const initialMapZoom: number = 2; // Zoom global

    return (
        <div className="container_mapa_eventos_atuais_page" style={{paddingBottom: '20px'}}>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                <span className="material-icons-outlined" style={{ fontSize: '1.8em' }}>public</span>
                Mapa de Eventos Atuais/Por Data (NASA EONET)
            </h1>

            <p style={{textAlign: 'center', marginBottom: '20px', fontSize: '0.9em', color: '#555'}}>
                Busca o evento global mais recente (status: {fetchStatusGlobalRecente}, últimos {fetchDaysGlobalRecente} dias) ao carregar, ou use os filtros de data abaixo.
            </p>

            <form onSubmit={handleSearchByDateRange} className="form-container" style={{ maxWidth: '700px', margin: '0 auto 20px auto', padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <div className="form-row" style={{alignItems: 'flex-end', gap: '15px'}}>
                    <div className="form-group flex-item">
                        <label htmlFor="startDate">Data de Início:</label>
                        <input type="date" id="startDate" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="form-group flex-item">
                        <label htmlFor="endDate">Data de Fim:</label>
                        <input type="date" id="endDate" name="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <button type="submit" className="button button-primary" disabled={loading || !startDate || !endDate} style={{padding: '10px 15px'}}>
                            <span className="material-icons-outlined" style={{fontSize: '1.2em'}}>search</span> Buscar por Data
                        </button>
                    </div>
                </div>
                {(!startDate || !endDate) && <p style={{fontSize: '0.8em', textAlign: 'center', color: '#777', marginTop: '5px'}}>Selecione um intervalo de datas para habilitar a busca.</p>}
            </form>

            {/* Seção de Detalhes do Evento */}
            {displayedEventDetails && !loading && ( // Só exibe se não estiver carregando outros dados
                <div className="event-details-box" style={{
                    margin: '20px auto', padding: '15px', border: '1px solid #ddd',
                    borderRadius: '8px', backgroundColor: '#f9f9f9', maxWidth: '700px'
                }}>
                    <h3 style={{ marginTop: '0', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px', fontSize: '1.2em' }}>
                        <span className="material-icons-outlined" style={{verticalAlign: 'bottom', marginRight: '5px'}}>event_note</span>
                        Detalhes do Evento Exibido
                    </h3>
                    <p><strong>Título:</strong> {displayedEventDetails.title}</p>
                    <p><strong>Data (primeira geometria):</strong> {formatEventDate(displayedEventDetails.geometry?.[0]?.date)}</p>
                    <p><strong>ID EONET:</strong> {displayedEventDetails.id}</p>
                    {displayedEventDetails.categories && displayedEventDetails.categories.length > 0 && (
                        <p><strong>Categorias:</strong> {displayedEventDetails.categories.map(c => c.title).join(', ')}</p>
                    )}
                    {markers.length === 1 && markers[0]?.position && ( // Mostra coordenadas se houver apenas um marcador (o evento em detalhe)
                        <p><strong>Coordenadas:</strong> Latitude: {markers[0].position[0].toFixed(5)}, Longitude: {markers[0].position[1].toFixed(5)}</p>
                    )}
                    <p><strong>Status:</strong> {displayedEventDetails.closed ? `Fechado em ${formatEventDate(displayedEventDetails.closed)}` : 'Aberto'}</p>
                    <p><a href={displayedEventDetails.link} target="_blank" rel="noopener noreferrer" className="link-external">
                        Ver na fonte (EONET) <span className="material-icons-outlined" style={{fontSize: '1em', verticalAlign: 'middle'}}>open_in_new</span>
                    </a></p>
                </div>
            )}

            {infoMessage && !loading && !error && (!displayedEventDetails || markers.length !== 1) &&
                <p className="message info" style={{textAlign: 'center', marginBottom: '15px'}}>{infoMessage}</p>
            }
            {loading && (
                <div className="flex items-center justify-center" style={{minHeight: '400px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9'}}>
                    <p className="text-lg text-slate-600">Buscando eventos da NASA...</p>
                </div>
            )}
            {error && !loading && (
                <div className="message error" style={{textAlign: 'center', padding: '20px', border: '1px solid #f5c6cb', borderRadius: '8px', marginTop: '15px'}}>
                    <p>{error}</p>
                </div>
            )}

            {(!loading) && ( // Renderiza o mapa se não estiver carregando (mesmo que haja erro, o mapa vazio pode ser mostrado)
                <div style={{ height: '60vh', minHeight: '450px', width: '100%', marginTop: '10px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
                    <DynamicEonetEventMap
                        initialCenter={markers.length > 0 ? undefined : initialMapCenter}
                        initialZoom={markers.length > 0 ? undefined : initialMapZoom}
                        markersData={markers}
                    />
                    {markers.length === 0 && !loading && !error && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            padding: '20px 30px', borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                            textAlign: 'center', zIndex: 1000
                        }}
                             className="text-slate-700 text-lg p-4 rounded-md shadow-lg" // Classes Tailwind do original
                        >
                            {startDate && endDate ? 'Nenhum evento com coordenadas válidas para o período.' : 'Mapa pronto. Use os filtros de data ou aguarde a busca inicial.'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}