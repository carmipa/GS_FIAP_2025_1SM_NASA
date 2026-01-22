'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet'; // Corrigido para evitar require()

export interface EventMapMarkerData {
    id: string;
    position: [number, number];
    popupText: string;
}

export interface EonetEventMapProps {
    initialCenter?: [number, number];
    initialZoom?: number;
    markersData?: EventMapMarkerData[];
    mapContainerStyle?: React.CSSProperties;
    className?: string;
}

const FitBoundsToMarkers: React.FC<{ markers: EventMapMarkerData[] }> = ({ markers }) => {
    const map = useMap();

    useEffect(() => {
        if (markers && markers.length > 0) {
            const markerPositions = markers.map(marker => marker.position as L.LatLngExpression);
            const bounds = L.latLngBounds(markerPositions);
            try {
                if (map.getContainer().offsetWidth > 0 && map.getContainer().offsetHeight > 0) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
                } else {
                    setTimeout(() => {
                        if (map.getContainer().offsetWidth > 0 && map.getContainer().offsetHeight > 0) {
                            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
                        }
                    }, 200);
                }
            } catch (e) {
                console.warn("Não foi possível ajustar os limites do mapa (fitBounds):", e);
            }
        }
    }, [map, markers]);
    return null;
};

const EonetEventMap: React.FC<EonetEventMapProps> = ({
    initialCenter = [-14.235004, -51.92528],
    initialZoom = 4,
    markersData = [],
    mapContainerStyle,
    className
}) => {
    const [isClient, setIsClient] = useState(false);
    const [leafletDefaultIcon, setLeafletDefaultIcon] = useState<L.Icon | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsClient(true);

            const icon = new L.Icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            setLeafletDefaultIcon(icon);
        }
    }, []);

    const streetTiles = {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    };

    const satelliteTiles = {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: 'Tiles &copy; Esri &mdash; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    };

    if (!isClient || !leafletDefaultIcon) {
        return (
            <div
                style={mapContainerStyle || { height: '100%', width: '100%', minHeight: '400px', backgroundColor: '#e0e0e0' }}
                className={`${className || ''} flex items-center justify-center`}
            >
                <p>Carregando mapa de eventos...</p>
            </div>
        );
    }

    const mapKey = markersData.length > 0 ? markersData.map(m => m.id).join('_') : 'initial_map';

    return (
        <MapContainer
            key={mapKey}
            center={(markersData && markersData.length > 0 && markersData[0].position) ? markersData[0].position : initialCenter}
            zoom={(markersData && markersData.length > 0) ? 10 : initialZoom}
            style={mapContainerStyle || { height: '100%', width: '100%' }}
            className={className}
            scrollWheelZoom={true}
            attributionControl={true}
        >
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Mapa de Ruas">
                    <TileLayer url={streetTiles.url} attribution={streetTiles.attribution} />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Imagem de Satélite">
                    <TileLayer url={satelliteTiles.url} attribution={satelliteTiles.attribution} />
                </LayersControl.BaseLayer>
            </LayersControl>

            {markersData.map((marker) => (
                <Marker key={marker.id} position={marker.position} icon={leafletDefaultIcon!}>
                    <Popup>
                        <div dangerouslySetInnerHTML={{ __html: marker.popupText }} />
                    </Popup>
                </Marker>
            ))}

            <FitBoundsToMarkers markers={markersData} />
        </MapContainer>
    );
};

export default EonetEventMap;
