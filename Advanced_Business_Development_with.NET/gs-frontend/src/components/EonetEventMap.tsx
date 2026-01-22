// src/components/EonetEventMap.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ícone padrão do Leaflet
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Interface para os dados de cada marcador
export interface EventMapMarkerData {
    id: string; // ID único para a key do React
    position: [number, number]; // [latitude, longitude]
    popupText: string; // Conteúdo HTML para o popup
}

interface EonetEventMapProps {
    initialCenter?: [number, number]; // Centro inicial se não houver marcadores
    initialZoom?: number; // Zoom inicial se não houver marcadores
    markersData?: EventMapMarkerData[]; // Array de dados dos marcadores
    style?: React.CSSProperties;
    className?: string;
}

// Subcomponente para ajustar os limites do mapa aos marcadores
const FitBoundsToMarkers: React.FC<{ markers: EventMapMarkerData[] }> = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers && markers.length > 0) {
            const markerPositions = markers.map(marker => marker.position as L.LatLngExpression);
            if (markerPositions.length > 0) {
                const bounds = L.latLngBounds(markerPositions);
                map.fitBounds(bounds, { padding: [50, 50] }); // Adiciona um padding
            }
        }
    }, [map, markers]);
    return null;
};

const EonetEventMap: React.FC<EonetEventMapProps> = ({
                                                         initialCenter = [-14.235004, -51.92528], // Padrão: Centro do Brasil
                                                         initialZoom = 4,
                                                         markersData = [],
                                                         style,
                                                         className
                                                     }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(typeof window !== 'undefined');
    }, []);

    if (!isClient) {
        return (
            <div style={style || { height: '500px', width: '100%', backgroundColor: '#e0e0e0' }} className={`${className || ''} flex items-center justify-center`}>
                <p>Carregando mapa de eventos...</p>
            </div>
        );
    }

    return (
        <MapContainer
            center={initialCenter} // Usado se FitBoundsToMarkers não for ativado
            zoom={initialZoom}     // Usado se FitBoundsToMarkers não for ativado
            style={style || { height: '100%', width: '100%' }}
            className={className}
            scrollWheelZoom={true}
            attributionControl={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markersData.map((marker) => (
                <Marker key={marker.id} position={marker.position} icon={defaultIcon}>
                    <Popup>
                        {/* Permitir HTML simples no popupText */}
                        <div dangerouslySetInnerHTML={{ __html: marker.popupText }} />
                    </Popup>
                </Marker>
            ))}
            {markersData.length > 0 && <FitBoundsToMarkers markers={markersData} />}
        </MapContainer>
    );
};

export default EonetEventMap;