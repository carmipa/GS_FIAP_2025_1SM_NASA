package br.com.fiap.gs.gsapi.utils;

import java.util.Locale;

public class GeoUtils {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calcula uma bounding box aproximada dadas coordenadas centrais e um raio.
     * A API EONET espera o formato: W,S,E,N (minLon, minLat, maxLon, maxLat)
     *
     * @param centerLat Latitude central em graus.
     * @param centerLon Longitude central em graus.
     * @param radiusKm  Raio em quilômetros.
     * @return String da bounding box no formato "minLon,minLat,maxLon,maxLat".
     */
    public static String calcularBoundingBox(double centerLat, double centerLon, double radiusKm) {
        if (radiusKm <= 0) {
            throw new IllegalArgumentException("O raio deve ser positivo.");
        }

        // Converter latitude e longitude de graus para radianos
        double latRad = Math.toRadians(centerLat);
        double lonRad = Math.toRadians(centerLon);

        // Raio angular (distância angular do centro ao canto da "caixa")
        // Isso é uma simplificação; para maior precisão, cálculos esféricos mais complexos são necessários.
        // Esta abordagem trata o raio como a distância do centro aos lados N, S, E, O.
        double angularRadiusLatitude = radiusKm / EARTH_RADIUS_KM;
        double angularRadiusLongitude = radiusKm / (EARTH_RADIUS_KM * Math.cos(latRad)); // Ajuste para longitude baseado na latitude

        // Calcular latitudes mínimas e máximas
        double minLat = centerLat - Math.toDegrees(angularRadiusLatitude);
        double maxLat = centerLat + Math.toDegrees(angularRadiusLatitude);

        // Calcular longitudes mínimas e máximas
        double minLon = centerLon - Math.toDegrees(angularRadiusLongitude);
        double maxLon = centerLon + Math.toDegrees(angularRadiusLongitude);

        // Garantir que as latitudes estão dentro dos limites (-90 a +90)
        minLat = Math.max(minLat, -90.0);
        maxLat = Math.min(maxLat, 90.0);

        // Lidar com o cruzamento do meridiano de 180 graus para longitudes (simplificado)
        // Nota: EONET parece lidar bem com longitudes fora de +/-180 se a caixa cruzar o dateline,
        // mas é bom manter dentro do possível ou testar o comportamento específico da API.
        // Para esta implementação, não vamos complicar com o cruzamento do dateline.
        minLon = Math.max(minLon, -180.0); // Ajuste para não ir abaixo de -180
        maxLon = Math.min(maxLon, 180.0);   // Ajuste para não ir acima de 180

        // Formato EONET: W,S,E,N (Oeste, Sul, Leste, Norte)
        // minLon, minLat, maxLon, maxLat
        return String.format(Locale.US, "%.5f,%.5f,%.5f,%.5f", minLon, minLat, maxLon, maxLat);
    }
}
