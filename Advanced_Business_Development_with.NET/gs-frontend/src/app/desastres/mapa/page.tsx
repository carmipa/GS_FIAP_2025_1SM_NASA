// src/app/desastres/mapa/page.tsx
// Este componente deve ser compatível com as definições de apiService.ts e types.ts
// que foram alinhadas com o backend C#.
// A principal dependência é a estrutura do JSON armazenado no backend para EonetResponseDTO.json.
'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { listarEventosEonet } from '@/lib/apiService';
import type { EonetResponseDTO, NasaEonetEventDTO, NasaEonetGeometryDTO, Page } from '@/lib/types';
// Importar a interface de marcador do nosso types.ts (onde foi definida baseada em EonetEventMap)
import type { EventMapMarkerData } from '@/lib/types';

// Carregar dinamicamente o componente de mapa
const DynamicEonetEventMap = dynamic(() => import('@/components/EonetEventMap'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center w-full h-full bg-slate-100/80 rounded-md" style={{minHeight: '400px'}}>
            <p className="text-center text-slate-600 py-4 text-lg">Carregando mapa de eventos...</p>
        </div>
    ),
});

/**
 * Tenta converter a string JSON de um EonetResponseDTO para um objeto parcial NasaEonetEventDTO.
 * É crucial que o JSON armazenado no backend (campo EonetEvent.Json)
 * seja estruturalmente compatível com NasaEonetEventDTO.
 */
const parseEonetEventJson = (jsonString?: string): Partial<NasaEonetEventDTO> | null => {
    if (!jsonString) return null;
    try {
        return JSON.parse(jsonString) as Partial<NasaEonetEventDTO>;
    } catch (error) {
        console.error("Erro ao parsear JSON do evento EONET:", error, jsonString);
        return null;
    }
};

const getCoordinatesFromEvent = (geometries: NasaEonetGeometryDTO[] | undefined): [number, number] | null => {
    if (!geometries || geometries.length === 0) {
        return null;
    }
    // Prioriza geometria do tipo "Point"
    const pointGeometry = geometries.find(geom => geom.type === "Point");
    if (pointGeometry && Array.isArray(pointGeometry.coordinates) && pointGeometry.coordinates.length === 2) {
        // Coordenadas da NASA EONET são [longitude, latitude] para Points
        return [pointGeometry.coordinates[1] as number, pointGeometry.coordinates[0] as number]; // Leaflet espera [lat, lng]
    }
    // Fallback para a primeira geometria, tentando extrair um ponto (ex: de um Polygon)
    const firstGeom = geometries[0];
    if (firstGeom && Array.isArray(firstGeom.coordinates)) {
        if (firstGeom.type === "Polygon" &&
            Array.isArray(firstGeom.coordinates[0]) &&
            Array.isArray(firstGeom.coordinates[0][0]) &&
            firstGeom.coordinates[0][0].length === 2
        ) {
            // Pega o primeiro ponto do primeiro anel do polígono
            // Coordenadas da NASA EONET são [longitude, latitude]
            return [firstGeom.coordinates[0][0][1] as number, firstGeom.coordinates[0][0][0] as number]; // Leaflet espera [lat, lng]
        }
        // Adicionar mais lógicas se houver outros tipos de geometria complexa para extrair um ponto representativo
    }
    return null;
};

export default function MapaDeEventosPage() {
    const [markers, setMarkers] = useState<EventMapMarkerData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Centro aproximado do Brasil para o mapa inicial
    const initialMapCenter: [number, number] = [-14.235004, -51.92528];
    const initialMapZoom: number = 4;

    useEffect(() => {
        const fetchEventsAndCreateMarkers = async () => {
            setLoading(true);
            setError(null);
            setMarkers([]);
            try {
                // Busca os primeiros 50 eventos locais para popular o mapa
                const eventosPage: Page<EonetResponseDTO> = await listarEventosEonet(0, 50);
                const newMarkers: EventMapMarkerData[] = [];

                if (eventosPage && eventosPage.content) {
                    for (const eventoResp of eventosPage.content) {
                        const eventoDetalhes = parseEonetEventJson(eventoResp.json);

                        if (eventoDetalhes && eventoDetalhes.geometries) {
                            const coords = getCoordinatesFromEvent(eventoDetalhes.geometries);
                            if (coords) {
                                newMarkers.push({
                                    id: eventoResp.eonetIdApi || String(eventoResp.idEonet), // Usa eonetIdApi como ID primário se disponível
                                    position: coords, // [latitude, longitude]
                                    popupText: `<strong>${eventoDetalhes.title || 'Evento EONET'}</strong><br/>Data: ${eventoDetalhes.geometries[0].date ? new Date(eventoDetalhes.geometries[0].date).toLocaleDateString('pt-BR') : 'N/A'}<br/>Categorias: ${eventoDetalhes.categories?.map(c => c.title).join(', ') || 'N/A'}`,
                                });
                            }
                        }
                    }
                }
                setMarkers(newMarkers);
                if (newMarkers.length === 0 && eventosPage && eventosPage.content.length > 0) {
                    console.log("Eventos locais encontrados, mas nenhum com coordenadas válidas para exibir no mapa.");
                    // Poderia setar uma mensagem para o usuário aqui, se desejado.
                } else if (newMarkers.length === 0) {
                    console.log("Nenhum evento local encontrado ou nenhum com coordenadas.");
                }
            } catch (err: any) {
                console.error("Erro ao buscar ou processar eventos para o mapa:", err);
                setError(`Falha ao carregar dados para o mapa: ${err.message || 'Erro desconhecido'}`);
            } finally {
                setLoading(false);
            }
        };

        fetchEventsAndCreateMarkers();
    }, []);

    return (
        <div className="container_mapa_eventos_page" style={{paddingBottom: '20px'}}> {/* Classe do original mantida */}
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <span className="material-icons-outlined" style={{ fontSize: '1.8em' }}>map</span> {/* Ícone 'map' em vez de 'public' para este mapa específico */}
                Mapa Interativo de Eventos EONET (Locais)
            </h1>

            {loading && (
                <div className="flex items-center justify-center" style={{minHeight: '400px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9'}}>
                    <p className="text-lg text-slate-600">Carregando eventos no mapa...</p>
                </div>
            )}
            {error && !loading && (
                <div className="message error" style={{textAlign: 'center', padding: '20px', border: '1px solid #f5c6cb', borderRadius: '8px'}}>
                    <p>{error}</p>
                    <p style={{marginTop: '10px'}}>Tente sincronizar novos eventos no Painel EONET ou verifique os logs para mais detalhes.</p>
                </div>
            )}

            {!loading && !error && (
                // O container do mapa precisa de altura definida para ser visível
                <div style={{ height: '70vh', minHeight: '500px', width: '100%', marginTop: '10px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
                    <DynamicEonetEventMap
                        initialCenter={markers.length > 0 ? undefined : initialMapCenter} // Centraliza nos marcadores se houver, senão usa initialCenter
                        initialZoom={markers.length > 0 ? undefined : initialMapZoom}   // Zoom nos marcadores se houver, senão usa initialZoom
                        markersData={markers}
                    />
                    {markers.length === 0 && !loading && !error && ( // Mensagem se não houver marcadores e não estiver carregando/com erro
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '20px 30px', // Aumentado padding
                            borderRadius: '8px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                            textAlign: 'center',
                            zIndex: 1000 // Para garantir que fique sobre o placeholder do mapa
                        }}
                            // As classes Tailwind do original podem ser adicionadas aqui se Tailwind estiver configurado globalmente
                            // className="text-slate-700 text-lg p-4 rounded-md shadow-lg"
                        >
                            Nenhum evento com coordenadas válidas encontrado para exibir no mapa no momento.
                            <br />Tente sincronizar eventos na aba "Sincronizar NASA" do "Painel EONET".
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}