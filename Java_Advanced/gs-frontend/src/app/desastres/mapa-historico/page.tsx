'use client';

import React, { useState, FormEvent } from 'react';
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
        if (firstGeom.type === "Polygon" && Array.isArray(firstGeom.coordinates[0]) && Array.isArray(firstGeom.coordinates[0][0]) && firstGeom.coordinates[0][0].length === 2) {
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

const periodOptions = [
    { label: 'Últimos 7 dias', value: 7 },
    { label: 'Últimos 30 dias', value: 30 },
    { label: 'Últimos 90 dias (3 meses)', value: 90 },
    { label: 'Últimos 180 dias (6 meses)', value: 180 },
    { label: 'Último Ano (365 dias)', value: 365 },
    { label: 'Últimos 2 Anos', value: 365 * 2 },
    { label: 'Últimos 5 Anos', value: 365 * 5 },
    { label: 'Últimos 10 Anos', value: 365 * 10 },
];

const categoriasTraduzidas = [
    { id: "", nome: "Todos os Tipos" },
    { id: "drought", nome: "Seca" },
    { id: "dustHaze", nome: "Poeira e Névoa Seca" },
    { id: "earthquakes", nome: "Terremotos" },
    { id: "floods", nome: "Inundações" },
    { id: "landslides", nome: "Deslizamentos de Terra" },
    { id: "manmade", nome: "Eventos Causados pelo Homem" },
    { id: "seaLakeIce", nome: "Gelo Marinho/Lacustre" },
    { id: "severeStorms", nome: "Tempestades Severas" },
    { id: "snow", nome: "Neve Intensa" },
    { id: "tempExtremes", nome: "Temperaturas Extremas" },
    { id: "volcanoes", nome: "Vulcões" },
    { id: "waterColor", nome: "Alterações na Cor da Água" },
    { id: "wildfires", nome: "Incêndios Florestais" },
];

export default function MapaHistoricoPage() {
    const [markers, setMarkers] = useState<EventMapMarkerData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>("Selecione os filtros e clique em buscar para ver os eventos históricos.");

    const [selectedPeriodDays, setSelectedPeriodDays] = useState<number>(365);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [eventSearchLimit, setEventSearchLimit] = useState<number>(200);

    const initialMapCenter: [number, number] = [0, 0];
    const initialMapZoom: number = 2;

    const handleBuscarEventosHistoricos = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setInfoMessage(`Buscando eventos históricos (Período: ${periodOptions.find(p=>p.value === selectedPeriodDays)?.label || selectedPeriodDays + ' dias'}, Categoria: ${categoriasTraduzidas.find(c=>c.id === selectedCategoryId)?.nome || 'Todos'})...`);
        setMarkers([]);

        try {
            const eventos: NasaEonetEventDTO[] = await buscarEventosNasaProximos(
                undefined,
                undefined,
                undefined,
                eventSearchLimit,
                selectedPeriodDays,
                "all",
                undefined,
                undefined,
                undefined,
                selectedCategoryId || undefined
            );

            if (!eventos || eventos.length === 0) {
                setInfoMessage("Nenhum evento histórico encontrado para os filtros selecionados.");
                setLoading(false);
                return;
            }

            const newMarkers: EventMapMarkerData[] = [];
            for (const eventoNasa of eventos) {
                if (eventoNasa.geometry && eventoNasa.geometry.length > 0) {
                    const coords = getCoordinatesFromEvent(eventoNasa.geometry);
                    if (coords) {
                        newMarkers.push({
                            id: eventoNasa.id,
                            position: coords,
                            popupText: `<strong>${eventoNasa.title || 'Evento EONET'}</strong><br/>Data: ${formatDate(eventoNasa.geometry[0].date)}<br/>Categoria: ${eventoNasa.categories?.map(c => c.title).join(', ') || 'N/A'}`,
                        });
                    }
                }
            }
            setMarkers(newMarkers);
            if (newMarkers.length > 0) {
                setInfoMessage(`${newMarkers.length} evento(s) histórico(s) encontrado(s).`);
            } else {
                setInfoMessage("Eventos foram encontrados, mas nenhum possui coordenadas válidas para exibição no mapa.");
            }

        } catch (err: unknown) {
            console.error("Erro ao buscar eventos históricos:", err);
            let errorMessage = 'Erro desconhecido ao buscar eventos históricos.';
            if (err instanceof Error) {
                errorMessage = err.message || errorMessage;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            setError(`Falha ao buscar eventos históricos: ${errorMessage}`);
            setInfoMessage(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container_mapa_historico_page" style={{paddingBottom: '20px', fontFamily: 'Arial, sans-serif'}}>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <span className="material-icons-outlined" style={{ fontSize: '1.8em' }}>history</span>
                Mapa Interativo de Desastres Históricos (NASA API)
            </h1>

            <form onSubmit={handleBuscarEventosHistoricos} className="form-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '800px', margin: '0 auto 30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
                    <div className="form-group" style={{flex: '1 1 200px'}}>
                        <label htmlFor="periodSelect" style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Período:</label>
                        <select
                            id="periodSelect"
                            value={selectedPeriodDays}
                            onChange={(e) => setSelectedPeriodDays(Number(e.target.value))}
                            disabled={loading}
                            style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}
                        >
                            {periodOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                        </select>
                    </div>

                    <div className="form-group" style={{flex: '1 1 200px'}}>
                        <label htmlFor="categorySelect" style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Tipo de Desastre:</label>
                        <select
                            id="categorySelect"
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            disabled={loading}
                            style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}
                        >
                            {categoriasTraduzidas.map(cat => (<option key={cat.id} value={cat.id}>{cat.nome}</option>))}
                        </select>
                    </div>
                    <div className="form-group" style={{flex: '1 1 150px'}}>
                        <label htmlFor="eventLimitInput" style={{display: 'block', marginBottom: '5px', fontWeight: '500'}}>Limite de Eventos:</label>
                        <input
                            type="number"
                            id="eventLimitInput"
                            value={eventSearchLimit}
                            min="1"
                            max="1000"
                            onChange={(e) => setEventSearchLimit(Number(e.target.value))}
                            disabled={loading}
                            style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}
                        />
                    </div>
                </div>
                <button type="submit" className="button button-primary" disabled={loading} style={{width: '100%', padding: '12px', fontSize: '1.1em', marginTop: '10px'}}>
                    {loading ? 'Buscando Eventos...' : 'Buscar Eventos Históricos'}
                </button>
            </form>

            {loading && (
                <div style={{textAlign: 'center', margin: '20px 0'}}><p className="message info">Buscando dados...</p></div>
            )}
            {error && !loading && (
                <div className="message error" style={{textAlign: 'center', padding: '15px', border: '1px solid #f5c6cb', borderRadius: '8px', backgroundColor: '#f8d7da', color: '#721c24', maxWidth: '700px', margin: '20px auto'}}>
                    <p style={{margin:0}}>{error}</p>
                </div>
            )}
            {infoMessage && !loading && !error && (
                <p className="message info" style={{textAlign: 'center', margin: '20px 0', color: '#555', fontSize: '1em'}}>{infoMessage}</p>
            )}

            <div style={{ height: '70vh', minHeight: '500px', width: '100%', marginTop: '20px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
                <DynamicEonetEventMap
                    initialCenter={initialMapCenter}
                    initialZoom={initialMapZoom}
                    markersData={markers}
                />
                {markers.length === 0 && !loading && !error && (!infoMessage || !infoMessage.includes("encontrado(s)")) && (
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '20px 30px', borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)', textAlign: 'center', zIndex: 1000
                    }}
                        className="text-slate-700 text-lg p-4 rounded-md shadow-lg"
                    >
                        {infoMessage || "Selecione os filtros e clique em 'Buscar Eventos Históricos'."}
                    </div>
                )}
            </div>
        </div>
    );
}