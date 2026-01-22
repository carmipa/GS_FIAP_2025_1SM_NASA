//――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// components\LeafletMap.tsx | arquivo LeafletMap.tsx
//――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

// src/components/LeafletMap.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// O CSS do Leaflet é importado em app/contato/layout.tsx
// import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correção para o ícone padrão do Leaflet em Next.js
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface LeafletMapProps {
    position: [number, number];
    zoom?: number;
    markerText?: string;
    style?: React.CSSProperties; // Para estilos inline se necessário
    className?: string;          // Para classes CSS (ex: Tailwind)
}

// Componente para recentralizar o mapa quando a posição mudar
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
                                                   position,
                                                   zoom = 16,
                                                   markerText = "Localização",
                                                   style, // Pode ser usado para sobrescrever altura/largura padrão se necessário
                                                   className
                                               }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(typeof window !== 'undefined');
    }, []);

    if (!isClient) {
        // Renderiza um placeholder no servidor ou antes da hidratação no cliente
        return (
            <div style={style || { height: '350px', width: '100%', backgroundColor: '#e0e0e0' }} className={`${className || ''} flex items-center justify-center`}>
                <p>Carregando mapa...</p>
            </div>
        );
    }

    // Garante que a posição é um array de números válido
    const validPosition: [number, number] = Array.isArray(position) && position.length === 2 && typeof position[0] === 'number' && typeof position[1] === 'number'
        ? position
        : [0, 0]; // Posição padrão caso inválida

    return (
        <MapContainer
            center={validPosition}
            zoom={zoom}
            style={style || { height: '100%', width: '100%' }} // Usa 100% para preencher o container pai (.leaflet-container)
            className={className} // Aplica classes CSS externas se houver
            scrollWheelZoom={true} // Habilitar zoom com scroll por padrão
            attributionControl={true} // Mostrar atribuição por padrão
        >
            <ChangeView center={validPosition} zoom={zoom} /> {/* Para atualizar o mapa se a props mudar */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={validPosition} icon={defaultIcon}>
                {markerText && <Popup>{markerText}</Popup>}
            </Marker>
        </MapContainer>
    );
};

export default LeafletMap;